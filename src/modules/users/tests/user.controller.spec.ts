import 'reflect-metadata';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { UserSerializer } from '../serializers/user.serializer';

jest.mock('../services/user.service');

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  beforeEach(() => {
    (UserService as unknown as jest.Mock).mockClear();
    controller = new UserController();
    userService = (controller as any).userService;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('index', () => {
    it('should return an array of users', async () => {
      const result = [{ id: 1, email: 'test@example.com', name: 'Test User', createdAt: new Date() }];
      // @ts-ignore
      userService.findAll.mockResolvedValue(result);

      const expected = JSON.parse(JSON.stringify(result)); // Simulate serialization behavior for simple check or just check properties
      // Actually, plainToInstance returns class instances.
      // Let's just check if it matches the structure we expect.
      const response = await controller.index({} as any, {} as any);
      expect(response).toHaveLength(1);
      expect(response[0]).toBeInstanceOf(UserSerializer);
      expect(response[0].id).toBe(result[0].id);
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto = { email: 'test@example.com', password: 'password', name: 'Test User' };
      const result = { id: 1, ...dto, createdAt: new Date() };
      // @ts-ignore
      userService.create.mockResolvedValue(result);

      const response = await controller.create({ body: dto } as any, {} as any);
      expect(response).toBeInstanceOf(UserSerializer);
      expect(response.id).toBe(result.id);
      expect((response as any).password).toBeUndefined();
    });
  });
});
