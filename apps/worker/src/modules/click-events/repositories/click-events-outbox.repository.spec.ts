import { Model } from 'mongoose';
import { CLICK_EVENT_OUTBOX_MAX_ATTEMPTS } from '../click-events.constants';
import { ClickEventOutboxDocument } from '../schemas/click-event-outbox.schema';
import { ClickEventsOutboxRepository } from './click-events-outbox.repository';

describe('ClickEventsOutboxRepository', () => {
  let repository: ClickEventsOutboxRepository;
  let outboxModel: jest.Mocked<
    Pick<Model<ClickEventOutboxDocument>, 'findById' | 'updateOne'>
  >;

  beforeEach(() => {
    outboxModel = {
      findById: jest.fn(),
      updateOne: jest.fn(),
    };

    repository = new ClickEventsOutboxRepository(
      outboxModel as unknown as Model<ClickEventOutboxDocument>,
    );
  });

  it('should mark outbox event as dead when max attempts are exhausted', async () => {
    const execFindById = jest.fn().mockResolvedValue({
      attempts: CLICK_EVENT_OUTBOX_MAX_ATTEMPTS,
    });
    const select = jest.fn().mockReturnValue({ exec: execFindById });
    const execUpdateOne = jest.fn().mockResolvedValue({});

    outboxModel.findById.mockReturnValue({ select } as never);
    outboxModel.updateOne.mockReturnValue({ exec: execUpdateOne } as never);

    await repository.markFailed(
      '507f1f77bcf86cd799439011',
      new Error('mongo failed'),
    );

    expect(outboxModel.updateOne).toHaveBeenCalledWith(expect.any(Object), {
      $set: {
        status: 'dead',
        lockedAt: null,
        nextRetryAt: null,
        lastError: 'mongo failed',
      },
    });
  });

  it('should keep outbox event retryable before max attempts are exhausted', async () => {
    const execFindById = jest.fn().mockResolvedValue({
      attempts: CLICK_EVENT_OUTBOX_MAX_ATTEMPTS - 1,
    });
    const select = jest.fn().mockReturnValue({ exec: execFindById });
    const execUpdateOne = jest.fn().mockResolvedValue({});

    outboxModel.findById.mockReturnValue({ select } as never);
    outboxModel.updateOne.mockReturnValue({ exec: execUpdateOne } as never);

    await repository.markFailed(
      '507f1f77bcf86cd799439011',
      new Error('mongo failed'),
    );

    expect(outboxModel.updateOne).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        $set: expect.objectContaining({
          status: 'failed',
          lockedAt: null,
          lastError: 'mongo failed',
        }) as object,
      }),
    );
  });
});
