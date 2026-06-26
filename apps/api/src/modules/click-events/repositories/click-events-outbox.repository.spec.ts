import { Model } from 'mongoose';
import { ClickEventOutboxDocument } from '../schemas/click-event-outbox.schema';
import { ClickEventsOutboxRepository } from './click-events-outbox.repository';

describe('ClickEventsOutboxRepository', () => {
  let repository: ClickEventsOutboxRepository;
  let outboxModel: jest.Mocked<
    Pick<Model<ClickEventOutboxDocument>, 'countDocuments'>
  >;

  beforeEach(() => {
    outboxModel = {
      countDocuments: jest.fn(),
    };
    repository = new ClickEventsOutboxRepository(
      outboxModel as unknown as Model<ClickEventOutboxDocument>,
    );
  });

  it('should count outbox events by status', async () => {
    const exec = jest
      .fn()
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(5);

    outboxModel.countDocuments.mockReturnValue({ exec } as never);

    await expect(repository.countByStatus()).resolves.toEqual({
      pending: 1,
      processing: 2,
      failed: 3,
      dead: 4,
      processed: 5,
    });
  });
});
