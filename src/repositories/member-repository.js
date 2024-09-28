const { Op } = require("sequelize");
const db = require("../config/database");
const initModels = require("../models/init-models");

const { member, reff_user_status } = initModels(db);

const getAll = async (param) => {
  const { page, size, status, search } = param;
  let offset;
  let limitOffset;
  let whereClause = {};

  if (status && status != "") {
    whereClause.user_status_id = status;
  }

  if (search) {
    whereClause[Op.or] = [
      { fullname: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  if (page && size) {
    offset = (page - 1) * size;
    limitOffset = {
      limit: size,
      offset: offset,
    };
  }

  if (page && size) {
    // With Pagination
    const result = await member.findAndCountAll({
      attributes: {
        exclude: ["password", "wrong_password_cnt", "otp", "expired_otp"],
      },
      where: whereClause || undefined,
      ...limitOffset,
      include: [
        {
          model: reff_user_status,
          as: "user_status",
        },
        // {
        //   model: member,
        //   as: "parent",
        // },
        // {
        //   model: member,
        //   as: "children",
        // },
      ],
    });

    return {
      items: result.rows,
      pagination: {
        total_records: result.count,
        total_pages: Math.ceil(result.count / size),
        current_page: page,
      },
    };
  }

  // Without pagination
  const result = await member.findAll({
    where: whereClause || undefined,
    include: [
      {
        model: reff_user_status,
        as: "user_status",
      },
    ],
  });

  return result;
};

const getDataByEmail = async (email) => {
  return await member.findOne({
    where: {
      email: email,
    },
  });
};

const getDataByStatusId = async (status) => {
  return await member.findOne({
    include: [
      {
        model: reff_user_status,
        as: "user_status",
      },
    ],
    where: {
      user_status_id: status,
    },
  });
};

const getDataById = async (memberId, options) => {
  return await member.findByPk(memberId, options);
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

  return parseInt(total);
};

const updateStatusMember = async (memberId, data, transaction) => {
  return await member.update(data, {
    where: {
      id: memberId,
    },
    returning: true,
    transaction,
  });
};

const getTotalDirectDownline = async (parentMemberId, status = "all") => {
  const whereClause = {
    member_id_parent: parentMemberId,
  };

  if (status != "all") {
    whereClause.user_status_id = status;
  }

  return await member.count({
    where: whereClause,
  });
};

const getTotalDownlineByParentAndRankingId = async (memberIdParent, rankingId) => {
  return await member.count({
    where: {
      member_id_parent: memberIdParent,
      ranking_id: rankingId,
    },
  });
};

module.exports = {
  getDataByEmail,
  getDataByReferalCode,
  store,
  getDataById,
  getDataByMemberParentId,
  getTotalDownlineByMemberParentId,
  getDataByStatusId,
  getAll,
  updateStatusMember,
  getTotalDirectDownline,
  getTotalDownlineByParentAndRankingId,
};
