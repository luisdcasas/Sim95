"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  type AssessmentDefinition,
  type AssessmentInstance,
  type ComputedResults,
} from "@/types/assessment";
import { useAuth } from "./AuthContext";
import { computeResults } from "@/utils/scoringEngine";

interface AssessmentContextType {
  definitions: AssessmentDefinition[];
  instances: AssessmentInstance[];
  definitionsLoading: boolean;
  instancesLoading: boolean;
  createInstance: (definitionId: string, userId: string) => Promise<string>;
  saveAnswers: (instanceId: string, answers: Record<string, any>) => Promise<void>;
  completeAssessment: (instanceId: string) => Promise<ComputedResults>;
  deleteInstance: (instanceId: string) => Promise<void>;
  getInstanceById: (instanceId: string) => AssessmentInstance | undefined;
  getAllInstances: () => AssessmentInstance[];
  getUserInstances: (userId: string) => AssessmentInstance[];
  refreshDefinitions: () => Promise<void>;
  refreshInstances: () => Promise<void>;
}

type DefinitionRow = {
  id: string;
  name: string;
  version: string;
  description: string | null;
  questions: Record<string, any>[] | null;
  scoring_rules: Record<string, any> | null;
  created_at: string;
  updated_at: string;
};

type InstanceRow = {
  id: string;
  user_id: string;
  definition_id: string;
  version: string;
  status: AssessmentInstance["status"];
  raw_answers: Record<string, any> | null;
  computed_results: ComputedResults | null;
  started_at: string;
  completed_at: string | null;
};

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const { user, isAdmin } = useAuth();
  const [definitions, setDefinitions] = useState<AssessmentDefinition[]>([]);
  const [instances, setInstances] = useState<AssessmentInstance[]>([]);
  const [definitionsLoading, setDefinitionsLoading] = useState(true);
  const [instancesLoading, setInstancesLoading] = useState(true);

  const EMPTY_SCORING_RULES = {
    subsystems: [],
    hiddenVariables: [],
    reportTemplates: [],
  };
  const mapDefinitionRow = useCallback(
    (row: DefinitionRow): AssessmentDefinition => {
      return {
        id: row.id,
        name: row.name,
        version: row.version,
        description: row.description ?? "",
        questions: (row.questions as AssessmentDefinition["questions"]) ?? [],
        scoringRules:
          (row.scoring_rules as AssessmentDefinition["scoringRules"]) ??
          EMPTY_SCORING_RULES,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    },
    []
  );

  const mapInstanceRow = useCallback((row: InstanceRow): AssessmentInstance => {
    return {
      id: row.id,
      userId: row.user_id,
      definitionId: row.definition_id,
      version: row.version,
      status: row.status,
      rawAnswers: row.raw_answers ?? {},
      computedResults: row.computed_results,
      startedAt: row.started_at,
      completedAt: row.completed_at,
    };
  }, []);

  const loadDefinitions = useCallback(async () => {
    setDefinitionsLoading(true);

    const { data, error } = await supabase
      .from("assessment_definitions")
      .select(
        "id, name, version, description, questions, scoring_rules, created_at, updated_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load definitions", error);
      setDefinitions([]);
      setDefinitionsLoading(false);
      return;
    }

    setDefinitions((data ?? []).map(mapDefinitionRow));
    setDefinitionsLoading(false);
  }, [mapDefinitionRow, supabase]);

  const loadInstances = useCallback(async () => {
    if (!user) {
      setInstances([]);
      setInstancesLoading(false);
      return;
    }

    setInstancesLoading(true);
    let query = supabase
      .from("assessment_instances")
      .select(
        "id, user_id, definition_id, version, status, raw_answers, computed_results, started_at, completed_at"
      )
      .order("started_at", { ascending: false });

    if (!isAdmin) {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Failed to load instances", error);
      setInstances([]);
      setInstancesLoading(false);
      return;
    }

    setInstances((data ?? []).map(mapInstanceRow));
    setInstancesLoading(false);
  }, [isAdmin, mapInstanceRow, supabase, user]);

  useEffect(() => {
    loadDefinitions();
  }, [loadDefinitions]);

  useEffect(() => {
    loadInstances();
  }, [loadInstances]);

  const createInstance = useCallback(
    async (definitionId: string, userId: string) => {
      const definition = definitions.find((d) => d.id === definitionId);
      if (!definition) {
        throw new Error("Definition not found");
      }

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("assessment_instances")
        .insert({
          definition_id: definitionId,
          version: definition.version,
          user_id: userId,
          status: "in_progress",
          raw_answers: {},
          started_at: now,
          completed_at: null,
        })
        .select("*")
        .single<InstanceRow>();

      if (error) {
        console.error("Failed to create instance", error);
        throw error;
      }

      const mapped = mapInstanceRow(data);
      setInstances((prev) => [mapped, ...prev]);
      return mapped.id;
    },
    [definitions, mapInstanceRow, supabase]
  );

  const saveAnswers = useCallback(
    async (instanceId: string, answers: Record<string, any>) => {
      const instance = instances.find((i) => i.id === instanceId);
      if (!instance) {
        throw new Error("Instance not found");
      }

      const mergedAnswers = { ...(instance.rawAnswers ?? {}), ...answers };

      const { error } = await supabase
        .from("assessment_instances")
        .update({ raw_answers: mergedAnswers })
        .eq("id", instanceId);

      if (error) {
        console.error("Failed to save answers", error);
        throw error;
      }

      setInstances((prev) =>
        prev.map((inst) =>
          inst.id === instanceId ? { ...inst, rawAnswers: mergedAnswers } : inst
        )
      );
    },
    [instances, supabase]
  );

  const completeAssessment = useCallback(
    async (instanceId: string) => {
      const instance = instances.find((i) => i.id === instanceId);
      if (!instance) {
        throw new Error("Instance not found");
      }

      const definition = definitions.find((d) => d.id === instance.definitionId);
      if (!definition) {
        throw new Error("Definition not found");
      }

      const computedResults = computeResults(instance.rawAnswers, definition);
      computedResults.instanceId = instanceId;
      const completedAt = new Date().toISOString();

      const { data, error } = await supabase
        .from("assessment_instances")
        .update({
          status: "completed",
          completed_at: completedAt,
          computed_results: computedResults,
        })
        .eq("id", instanceId)
        .select("*")
        .single<InstanceRow>();

      if (error) {
        console.error("Failed to complete assessment", error);
        throw error;
      }

      const mapped = mapInstanceRow(data);
      setInstances((prev) =>
        prev.map((inst) => (inst.id === instanceId ? mapped : inst))
      );
      return computedResults;
    },
    [definitions, instances, mapInstanceRow, supabase]
  );

  const deleteInstance = useCallback(
    async (instanceId: string) => {
      const { error } = await supabase
        .from("assessment_instances")
        .delete()
        .eq("id", instanceId);

      if (error) {
        console.error("Failed to delete instance", error);
        throw error;
      }

      setInstances((prev) => prev.filter((inst) => inst.id !== instanceId));
    },
    [supabase]
  );

  const getInstanceById = (instanceId: string) =>
    instances.find((i) => i.id === instanceId);

  const getAllInstances = () => instances;

  const getUserInstances = (userId: string) =>
    instances.filter((i) => i.userId === userId);

  const value: AssessmentContextType = {
    definitions,
    instances,
    definitionsLoading,
    instancesLoading,
    createInstance,
    saveAnswers,
    completeAssessment,
    deleteInstance,
    getInstanceById,
    getAllInstances,
    getUserInstances,
    refreshDefinitions: loadDefinitions,
    refreshInstances: loadInstances,
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return context;
}
