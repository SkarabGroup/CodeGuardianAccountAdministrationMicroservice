import { AllExceptionsFilter } from '../../src/presentation/filters/exceptions.filter';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { InvalidCredentialsException } from '../../src/application/exceptions/invalid-credentials.exception';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockGetResponse: jest.Mock;
  let mockSwitchToHttp: jest.Mock;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
    mockSwitchToHttp = jest
      .fn()
      .mockReturnValue({ getResponse: mockGetResponse });

    mockHost = {
      switchToHttp: mockSwitchToHttp,
    } as unknown as ArgumentsHost;
  });

  it('should return 401 UNAUTHORIZED for InvalidCredentialsException', () => {
    const exception = new InvalidCredentialsException();

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Invalid Credentials, Email or password are incorrect',
      error: 'Unauthorized',
    });
  });

  it('should return 401 for exception with name "Email already in use"', () => {
    const exception = new Error('Some message');
    exception.name = 'Email already in use';

    filter.catch(exception, mockHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Some message',
      error: 'Conflict',
    });
  });

  it('should not call response for unhandled exceptions', () => {
    const exception = new Error('Generic error');

    filter.catch(exception, mockHost);

    expect(mockStatus).not.toHaveBeenCalled();
  });
});
