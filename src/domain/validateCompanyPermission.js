import { InvalidOperationError } from 'common-errors';

// In general on IAM, there are 3 general permissions, which are company, user and role
// only reseller company can have company permission
// throw exception when assign company resource on non reseller company
export function validateCompanyPermission(company, permissions) {
  if (!permissions || !permissions.company || !permissions.company.length) {
    return;
  }
  if (!company.reseller) {
    throw new InvalidOperationError('only reseller company can have permission on company resources');
  }
}

export default validateCompanyPermission;
