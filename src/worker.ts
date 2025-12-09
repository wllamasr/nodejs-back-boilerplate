import { startWorker } from '@framework/queue';
import { AppModule } from './app.module';
import { MODULE_METADATA_KEY, ModuleMetadata } from '@/core/decorators/module.decorator';
import { JobDefinition } from '@framework/queue';

// Helper to extract jobs from a module and its imports recursively
function getJobsFromModule(moduleClass: any, visited = new Set<any>()): JobDefinition<any>[] {
  if (visited.has(moduleClass)) {
    return [];
  }
  visited.add(moduleClass);

  const metadata: ModuleMetadata = Reflect.getMetadata(MODULE_METADATA_KEY, moduleClass);
  if (!metadata) {
    return [];
  }

  let jobs: JobDefinition<any>[] = metadata.jobs || [];

  if (metadata.imports) {
    for (const importedModule of metadata.imports) {
      jobs = [...jobs, ...getJobsFromModule(importedModule, visited)];
    }
  }

  return jobs;
}

const jobs = getJobsFromModule(AppModule);

console.log(`Found ${jobs.length} jobs: ${jobs.map(j => j.name).join(', ')}`);

startWorker(jobs);
