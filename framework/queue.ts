import { Queue, Worker, Job as BullJob } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const defaultQueue = new Queue('default', { connection });

export interface JobDefinition<T> {
  name: string;
  handle: (data: T) => Promise<void>;
  delay: (data: T) => Promise<BullJob<T>>;
}

export const createJob = <T>(name: string, handler: (data: T) => Promise<void>): JobDefinition<T> => {
  return {
    name,
    handle: handler,
    delay: async (data: T) => {
      return await defaultQueue.add(name, data);
    },
  };
};

export const startWorker = (jobs: JobDefinition<any>[]) => {
  const jobMap = new Map(jobs.map(job => [job.name, job]));

  const worker = new Worker('default', async (job) => {
    const registeredJob = jobMap.get(job.name);
    if (registeredJob) {
      console.log(`Processing job: ${job.name} (${job.id})`);
      await registeredJob.handle(job.data);
      console.log(`Completed job: ${job.name} (${job.id})`);
    } else {
      console.warn(`Unknown job: ${job.name}`);
    }
  }, { connection });

  console.log('Worker started and listening for jobs...');

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await worker.close();
  });

  return worker;
};
