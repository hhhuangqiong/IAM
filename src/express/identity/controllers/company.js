import { ArgumentError, NotFoundError } from 'common-errors';
import Q from 'q';

import Company from '../../../collections/company';
import { mongooseError } from '../../../utils/errorHelper';

// populate the query with user details and parent id
function doPopulateData(query) {
  return query.populate('parent', 'id -_id')
         .populate('createdBy', 'username -_id')
         .populate('updatedBy', 'username -_id');
}

// get the company from the mongoose
function getCompany(id, option, populateData) {
  const query = Company.findOne({ id }, option);
  if (populateData) {
    doPopulateData(query);
  }
  return query.then(company => {
    if (!company) {
      throw new ArgumentError(`company id ${id} is not found`);
    }
    return company;
  });
}

// convert the company id to object id
function convertIdToObjectId(id) {
    /* eslint no-underscore-dangle: ["error", { "allow": ["company", "_id"] }]*/
  return getCompany(id).then(company => company._id);
}

// create a new company
function createCompany(param) {
  return Company.create(param).catch(mongooseError);
}

function updateCompanyParam(param, userId) {
  const mParam = param;
  if (userId) {
    mParam.createdBy = userId;
    mParam.updatedBy = userId;
  }
  if (mParam.parent) {
    // convert the parent id into mongo _id
    return convertIdToObjectId(mParam.parent).then((id) => {
      mParam.parent = id;
      return mParam;
    });
  }

  return Q.resolve(mParam);
}

export default class CompanyController {
  create(param, userId) {
    return updateCompanyParam(param, userId).then(createCompany);
  }
  remove(id) {
    return getCompany(id).then(company => {
      // remove directly when no logo
      if (!company.logo) {
        return company.remove();
      }
      return company.removeLogo().then(() => company.remove());
    });
  }
  getAll(filter, pageNo, pageSize, sort) {
    const query = Company.find(filter, '-_id -__v')
      .skip(pageNo * pageSize)
      .limit(pageSize)
      .sort(sort);
    return doPopulateData(query);
  }
  getTotal(filter) {
    return Company.find(filter).count();
  }
  get(id) {
    return getCompany(id, '-_id -__v', true);
  }
  getLogo(id) {
    return Company.getLogo(id);
  }
  createLogo(file, companyId) {
    return getCompany(companyId).then(company => {
      if (company.logo) {
        return company.removeLogo().then(() =>
          company.addLogo(file.path, {
            mimeType: file.mimetype,
            filename: file.originalname,
          }));
      }
      return company.addLogo(file.path, {
        mimeType: file.mimetype,
        filename: file.originalname,
      });
    });
  }
  removeLogo(companyId) {
    return getCompany(companyId).then(company => {
      if (company.logo) {
        return company.removeLogo();
      }
      throw new NotFoundError('logo is not found');
    });
  }
  update(id, param, userId) {
    return updateCompanyParam(param)
      .then((updatedParam) =>
         Company.findOneAndUpdate({ id }, updatedParam, {
           runValidators: true,
           upsert: true,
           new: true,
         })
         .then((company) => {
            // determine whether createAt exist and indicate it is newly created
           if (company.createdAt.toString() === company.updatedAt.toString()) {
             return company;
           }

            // return null to indicate it is updated
            // update the userId;
           if (userId) {
             /* eslint no-param-reassign: ["error", { "props": false }]*/
             company.updatedBy = userId;
             return company.save().then(() => null);
           }
           return null;
         })
    );
  }
  replace(id, param, userId) {
    return updateCompanyParam(param, userId)
      .then((updatedParam) =>
        getCompany(id)
          .then((company) => {
            // replace the previous the record and create again
            const { createdBy, createdAt } = company;
            return this.remove(id)
              .then(() => {
                // need to update back the original data
                const newCompany = new Company(updatedParam);
                newCompany.createdBy = createdBy;
                newCompany.createdAt = createdAt;
                return newCompany.save()
                // return null to indicate it is updated
                .then(() => null);
              });
          })
          .catch((err) => {
            if (err && err.name === ArgumentError.name) {
              return createCompany(updatedParam);
            }
            throw err;
          })
      );
  }
}
