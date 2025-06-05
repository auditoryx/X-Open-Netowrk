import { isServiceOwner } from '../middleware/authMiddleware.js';
import Service from '../models/Service';

jest.mock('../models/Service');

const mockedService = Service as jest.Mocked<typeof Service>;

describe('isServiceOwner middleware', () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as any;
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls next when user owns the service', async () => {
    const req = { params: { id: '1' }, user: { _id: 'user1' } } as any;
    mockedService.findById.mockResolvedValue({ provider: 'user1' } as any);

    await isServiceOwner(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 when user does not own the service', async () => {
    const req = { params: { id: '1' }, user: { _id: 'user1' } } as any;
    mockedService.findById.mockResolvedValue({ provider: 'other' } as any);

    await isServiceOwner(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized to modify this service' });
    expect(next).not.toHaveBeenCalled();
  });
});
