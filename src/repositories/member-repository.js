const db = require("../config/database");
const initModels = require("../models/init-models");

const { member } = initModels(db);

// const getAll = async (param) => {
//   if ( param ) {

//   }
// }

const getDataByEmail = async (email) => {
  return await member.findOne({
    where: {
      email: email,
    },
  });
};

const getDataById = async (memberId) => {
  return await member.findByPk(memberId);
};

const getDataByReferalCode = async (refCode) => {
  return await member.findOne({
    where: {
      referal_code: refCode,
    },
  });
};

const store = async (data, transaction) => {
  return await member.create(data, {
    returning: true,
    transaction,
  });
};

const getDataByMemberParentId = async (memberId, param) => {
  let page = null;
  let size = null;
  let search = "";
  let offset = "";

  if (param) {
    page = param.page;
    size = param.size;
    search = param.search;
  }

  if (page && size) {
    offset = (page - 1) * size;
  }

  let query = `
    with recursive downline as (
      select
        m.id,
        m.fullname,
        m.email,
        m.user_status_id,
        m.referal_code,
        m.member_id_parent,
        rus.user_status_nm
      from
        "member" m
      join reff_user_status rus on
        rus.id = m.user_status_id
      where
        m.id = :member_id
      union
      select
        m.id,
        m.fullname,
        m.email,
        m.user_status_id,
        m.referal_code,
        m.member_id_parent,
        rus.user_status_nm
      from
        "member" m
      join reff_user_status rus on
        rus.id = m.user_status_id
      join downline b on
        m.member_id_parent = b.id
            )
      select
        *
      from
        downline d
      where 
        d.id != :member_id
  `;

  const replacements = {};
  replacements.member_id = memberId;

  if (search != "") {
    query += " AND (d.fullname ilike :search OR d.email ilike :search)";
    replacements.search = `%${search}%`;
  }

  if (page) {
    query += " limit :limit";
    replacements.limit = size;
  }

  if (offset) {
    query += " offset :offset";
    replacements.offset = offset;
  }

  const [results] = await db.query(query, {
    replacements: replacements,
  });

  return results;
};

const getTotalDownlineByMemberParentId = async (memberId) => {
  const countQuery = `
    with recursive downline as (
      select
        m.id,
        m.fullname,
        m.email,
        m.user_status_id,
        m.referal_code,
        m.member_id_parent,
        rus.user_status_nm
      from
        "member" m
      join reff_user_status rus on
        rus.id = m.user_status_id
      where
        m.id = :member_id
      union
      select
        m.id,
        m.fullname,
        m.email,
        m.user_status_id,
        m.referal_code,
        m.member_id_parent,
        rus.user_status_nm
      from
        "member" m
      join reff_user_status rus on
        rus.id = m.user_status_id
      join downline b on
        m.member_id_parent = b.id
            )
      select
        count(*) as total
      from
        downline d
      where
        d.id != :member_id
  `;

  const [[{ total }]] = await db.query(countQuery, {
    replacements: { member_id: memberId },
  });

  return total;
};

module.exports = {
  getDataByEmail,
  getDataByReferalCode,
  store,
  getDataById,
  getDataByMemberParentId,
  getTotalDownlineByMemberParentId,
};
