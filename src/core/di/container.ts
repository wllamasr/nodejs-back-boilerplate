export class Container {
  private static instances = new Map<any, any>();

  static get<T>(target: any): T {
    if (!this.instances.has(target)) {
      // For now, we assume simple instantiation without dependencies for services
      // In a real app, we'd need proper dependency resolution
      this.instances.set(target, new target());
    }
    return this.instances.get(target);
  }

  static set(target: any, instance: any) {
    this.instances.set(target, instance);
  }
}
