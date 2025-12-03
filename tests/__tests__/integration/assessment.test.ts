import Next from "next";
import request from "supertest";
import { createServer, Server } from "http";

let server: Server;

beforeAll(async () => {
  const app = Next({ dev: true, dir: "./" });
  await app.prepare();

  server = createServer(app.getRequestHandler());
  await new Promise<void>((resolve) => {
    server.listen(3005, () => resolve());
  });
});

afterAll(() => server.close());

test("assessment lifecycle end-to-end API", async () => {
  const start = await request(server)
    .post("/api/assessments/start")
    .send({ userId: "test-user" });

  expect(start.body.instanceId).toBeDefined();
  const id = start.body.instanceId;

  const submit = await request(server)
    .post(`/api/assessments/${id}/submit`)
    .send({ answers: { Q1: 5, Q2: 5 } });

  expect(submit.body.ok).toBe(true);

  const report = await request(server)
    .get(`/api/assessments/${id}/report`);

  expect(report.body.primary_archetype).toBeDefined();
});
