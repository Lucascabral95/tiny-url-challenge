import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const LOCAL_HOSTNAMES = new Set(['localhost', 'localhost.localdomain']);
const BLOCKED_HOSTNAME_SUFFIXES = ['.localhost', '.local'];

@ValidatorConstraint({ name: 'isPublicUrl', async: false })
export class IsPublicUrlConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    try {
      const url = new URL(value);

      if (!['http:', 'https:'].includes(url.protocol)) {
        return false;
      }

      const hostname = normalizeHostname(url.hostname);

      if (!hostname || isBlockedHostname(hostname)) {
        return false;
      }

      if (isIpv4(hostname)) {
        return isPublicIpv4(hostname);
      }

      if (isIpv6(hostname)) {
        return isPublicIpv6(hostname);
      }

      return hostname.includes('.');
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must point to a public http or https URL`;
  }
}

export function IsPublicUrl(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isPublicUrl',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsPublicUrlConstraint,
    });
  };
}

function normalizeHostname(hostname: string): string {
  return hostname
    .toLowerCase()
    .replace(/^\[(.*)]$/, '$1')
    .replace(/\.$/, '');
}

function isBlockedHostname(hostname: string): boolean {
  return (
    LOCAL_HOSTNAMES.has(hostname) ||
    BLOCKED_HOSTNAME_SUFFIXES.some((suffix) => hostname.endsWith(suffix))
  );
}

function isIpv4(hostname: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
}

function isPublicIpv4(hostname: string): boolean {
  const octets = hostname.split('.').map(Number);

  if (
    octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)
  ) {
    return false;
  }

  const [first, second] = octets;

  if (first === 10 || first === 127 || first === 0) {
    return false;
  }

  if (first === 100 && second >= 64 && second <= 127) {
    return false;
  }

  if (first === 169 && second === 254) {
    return false;
  }

  if (first === 172 && second >= 16 && second <= 31) {
    return false;
  }

  if (first === 192 && second === 168) {
    return false;
  }

  if (first === 198 && (second === 18 || second === 19)) {
    return false;
  }

  if (first >= 224) {
    return false;
  }

  return true;
}

function isIpv6(hostname: string): boolean {
  return hostname.includes(':');
}

function isPublicIpv6(hostname: string): boolean {
  if (hostname === '::' || hostname === '::1') {
    return false;
  }

  if (hostname.startsWith('::ffff:')) {
    const mappedIpv4 = hostname.replace('::ffff:', '');
    return isIpv4(mappedIpv4) && isPublicIpv4(mappedIpv4);
  }

  const firstHextet = Number.parseInt(hostname.split(':')[0] || '0', 16);

  if (!Number.isFinite(firstHextet)) {
    return false;
  }

  if ((firstHextet & 0xfe00) === 0xfc00) {
    return false;
  }

  if ((firstHextet & 0xffc0) === 0xfe80) {
    return false;
  }

  if ((firstHextet & 0xff00) === 0xff00) {
    return false;
  }

  return true;
}
