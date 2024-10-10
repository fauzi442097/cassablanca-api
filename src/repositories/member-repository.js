const { Op } = require("sequelize");
const db = require("../config/database");
const initModels = require("../models/init-models");
const sequelize = require("sequelize");
const { getLastMonth, getThisMonth } = require("../utils/helper");

const { member, reff_user_status, ranking, bonus } = initModels(db);

const getAllWithoutPaging = async (parentId) => {
  let whereConditions = {};

  if (parentId) {
    whereConditions[Op.or] = [{ id: parentId }, { member_id_parent: parentId }];
  }
  return await member.findAll({
    attributes: {
      exclude: [
        "password",
        "wrong_password_cnt",
        "otp",
        "expired_otp",
        "role_id",
      ],
    },
    include: [
      {
        model: ranking,
        as: "ranking",
      },
      {
        model: reff_user_status,
        as: "user_status",
      },
    ],
    where: whereConditions,
  });
};

const getAll = async (param) => {
  const { page, size, status, search, rank } = param;
  let offset;
  let limitOffset;
  let whereClause = {};

  if (status && status != "") {
    whereClause.user_status_id = {
      [Op.in]: status.split(","),
    };
  }

  if (rank && rank != "") {
    whereClause.ranking_id = {
      [Op.in]: rank.split(","),
    };
  }

  if (param.type && param.type == "genesis") {
    whereClause.member_id_parent = null;
  } else if (param.type && param.type == "regular") {
    whereClause.member_id_parent = {
      [Op.not]: null,
    };
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
        include: [
          "created_at",
          [
            sequelize.fn(
              "TO_CHAR",
              sequelize.col("member.created_at"),
              "Mon DD, YYYY"
            ),
            "date_joined",
          ],
          [
            sequelize.fn(
              "TO_CHAR",
              sequelize.col("member.created_at"),
              "HH24:MI"
            ),
            "time_joined",
          ],
        ],
      },
      where: whereClause || undefined,
      ...limitOffset,
      include: [
        {
          model: reff_user_status,
          as: "user_status",
        },
        {
          attributes: ["id", "ranking_nm"],
          model: ranking,
          as: "ranking",
        },
        {
          attributes: ["email", "fullname", "ranking_id", "photo_url"],
          model: member,
          as: "parent",
        },
      ],
      order: [["id", "DESC"]],
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
  let status = null;
  let rank = null;
  let search = "";
  let offset = "";

  if (param) {
    page = param.page;
    size = param.size;
    search = param.search;
    status = param.status;
    rank = param.rank;
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
      m.email_verified,
      m.photo_url,
      m.created_at,
      m.ranking_id
    from
      "member" m
    left join member m2 on
      m2.id = m.member_id_parent
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
      m.email_verified,
      m.photo_url,
      m.created_at,
      m.ranking_id
    from
      "member" m
    join downline b on
      m.member_id_parent = b.id
                )
      select
      d.id,
      d.fullname,
      d.email,
      d.user_status_id,
      rus.user_status_nm,
      d.referal_code,
      d.member_id_parent,
      d.photo_url,
      d.created_at,
      TO_CHAR(d.created_at, 'Mon DD, YYYY') as date_joined,
      TO_CHAR(d.created_at, 'HH24:MI') as time_joined,
      d.ranking_id,
      r.ranking_nm,
      o.paid_at,
      TO_CHAR(o.paid_at, 'Mon DD, YYYY') as date_activated,
      TO_CHAR(o.paid_at, 'HH24:MI') as time_activated,
      m2.fullname as upline,
      m2.email as upline_email,
      m2.photo_url  as upline_photo_url,
      m2.ranking_id as upline_ranking_id,
      r2.ranking_nm as upline_ranking
    from
      downline d
    left join member m2 on
      d.member_id_parent = m2.id
    left join reff_user_status rus on rus.id = d.user_status_id
    left join orders o on o.member_id = m2.id 
    left join ranking r on r.id = d.ranking_id
    left join ranking r2 on r2.id = m2.ranking_id 
    where
      d.id != :member_id
  `;

  const replacements = {};
  replacements.member_id = memberId;

  const hasSearchFilter = search && search != "";
  if (hasSearchFilter) {
    query += " AND (d.fullname ilike :search OR d.email ilike :search)";
    replacements.search = `%${search}%`;
  }

  const hasStatusFilter = status && status != "";
  if (hasStatusFilter) {
    const arrStatus = status.split(",");
    query += `AND (d.user_status_id IN (:status))`;
    replacements.status = arrStatus;
  }

  const hasRankFilter = rank && rank != "";
  if (hasRankFilter) {
    const arrRanking = rank.split(",");
    query += `AND (d.ranking_id IN (:ranking))`;
    replacements.ranking = arrRanking;
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
        m.email_verified,
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
        m.email_verified,
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

const getTotalDownlineByParentAndRankingId = async (
  memberIdParent,
  rankingId
) => {
  return await member.count({
    where: {
      member_id_parent: memberIdParent,
      ranking_id: rankingId,
    },
  });
};

const getTotalBonusByStatusOrder = async (params, bonusStatus) => {
  let offset;
  let limit;
  let whereClause = {};

  if (params.search) {
    whereClause[Op.or] = [
      { fullname: { [Op.iLike]: `%${params.search}%` } },
      { email: { [Op.iLike]: `%${params.search}%` } },
    ];
  }

  if (params.page && params.size) {
    offset = (params.page - 1) * params.size;
    limit = parseInt(params.size);
  }

  const response = await member.findAll({
    attributes: [
      [sequelize.col("member.id"), "id"],
      "fullname",
      "email",
      [sequelize.col("ranking.id"), "ranking_id"],
      "ranking.ranking_nm",
      [
        sequelize.fn(
          "SUM",
          sequelize.literal(
            `CASE WHEN bonuses.curr_id = 'ORE' THEN bonuses.amount END`
          )
        ),
        "total_ore",
      ],
      [
        sequelize.fn(
          "SUM",
          sequelize.literal(
            `CASE WHEN bonuses.curr_id = 'USDT' THEN bonuses.amount END`
          )
        ),
        "total_usdt",
      ],
    ],
    include: [
      {
        attributes: ["ranking_nm"],
        model: ranking,
        required: true,
        as: "ranking",
      },
      {
        attributes: [],
        model: bonus,
        as: "bonuses",
        required: true,
        where: {
          bonus_status_id: bonusStatus,
        },
      },
    ],
    where: whereClause,
    group: [
      "member.id",
      "member.fullname",
      "member.email",
      "ranking.id",
      "ranking.ranking_nm",
    ],
    subQuery: false,
    order: [
      ["total_ore", "DESC"],
      ["total_usdt", "DESC"],
    ],
    offset: offset,
    limit: limit,
  });

  if (params.page && params.size) {
    return {
      items: response,
      pagination: {
        total_records: response.length,
        total_pages: Math.ceil(response.length / params.size),
        current_page: params.page,
      },
    };
  }

  return response;
};

const getTotalDownlineByParentIdAndStatus = async (memberId, userStatusId) => {
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
        d.id != :member_id and d.user_status_id = :user_status_id
  `;

  const [[{ total }]] = await db.query(countQuery, {
    replacements: {
      member_id: memberId,
      user_status_id: userStatusId,
    },
  });

  return parseInt(total);
};

const getMemberDirectDownlineWithTotal = async (memberId) => {
  const query = `select
                    m.id,
                    m.fullname,
                    m.email,
                    rus.user_status_nm,
                    count(m2.id) as total
                  from
                    "member" m
                  left join reff_user_status rus on
                    rus.id = m.user_status_id
                  left join member m2 on
                    m2.member_id_parent = m.id
                  where
                    m.member_id_parent = :member_id
                  group by
                    m.id,
                    m.fullname,
                    m.email,
                    rus.user_status_nm
                  order by total desc`;

  const [result] = await db.query(query, {
    replacements: {
      member_id: memberId,
    },
  });

  return result;
};

const rekapMemberByStatus = async () => {
  const query = `select 
                    rus.user_status_nm,
                    count(m.id) as total
                  from
                    "member" m
                  left join reff_user_status rus on
                    rus.id = m.user_status_id
                  where
                    m.role_id = 2
                  group by
                    rus.user_status_nm`;

  const [result] = await db.query(query);
  return result;
};

const getDownlineMemberWithSelf = async (memberId) => {
  let query = `
    with recursive downline as (
      select
        m.id,
        m.fullname,
        m.email,
        m.user_status_id,
        m.referal_code,
        m.member_id_parent,
        m.photo_url,
        m.email_verified,
        rus.user_status_nm,
        r.ranking_nm,
        1 as level
      from
        "member" m
      join reff_user_status rus on rus.id = m.user_status_id
      left join ranking r on r.id = m.ranking_id
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
        m.photo_url,
        m.email_verified,
        rus.user_status_nm,
        r.ranking_nm,
        b.level + 1 as level
      from
        "member" m
      join reff_user_status rus on rus.id = m.user_status_id
      join downline b on m.member_id_parent = b.id
      left join ranking r on r.id = m.ranking_id
            )
      select
        d.id,
        d.fullname,
        d.email,
        d.user_status_id,
        d.referal_code,
        d.email_verified,
        case
          when d.level = 1 then null
          else member_id_parent 
        end as member_id_parent,
        d.user_status_nm,
        d.ranking_nm,
        d.level
      from
        downline d
  `;

  const [results] = await db.query(query, {
    replacements: {
      member_id: memberId,
    },
  });

  return results;
};

const updateMember = async (memberId, data, transaction) => {
  return await member.update(data, {
    where: {
      id: memberId,
    },
    returning: true,
    transaction,
  });
};

const getRekapMemberByParentId = async (memberId) => {
  const countQuery = `
    with recursive downline as (
      select
        m.id,
        m.fullname,
        m.email,
        m.user_status_id,
        m.referal_code,
        m.member_id_parent,
        m.email_verified,
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
        m.email_verified,
        rus.user_status_nm
      from
        "member" m
      join reff_user_status rus on
        rus.id = m.user_status_id
      join downline b on
        m.member_id_parent = b.id
            )
      select
        sum(case when d.user_status_id = 1 then 1 else 0 end) as activated_member,
        sum(case when d.user_status_id = 2 then 1 else 0 end) as blocked_member,
        sum(case when d.user_status_id = 3 then 1 else 0 end) as inactivated_member,
        count(d.id) as total
      from
        downline d
      where
        d.id != :member_id
  `;

  const [[response]] = await db.query(countQuery, {
    replacements: { member_id: memberId },
  });

  return response;
};

const getRekapAllMember = async () => {
  const countQuery = `
      select
        sum(case when d.user_status_id = 1 then 1 else 0 end) as activated_member,
        sum(case when d.user_status_id = 2 then 1 else 0 end) as blocked_member,
        sum(case when d.user_status_id = 3 then 1 else 0 end) as inactivated_member,
        count(d.id) as total
      from
        member d
  `;

  const [[response]] = await db.query(countQuery);
  return response;
};

const getRekapMemberGrowthByStatus = async (status) => {
  const { startDate: startDateLastMonth, endDate: endDateLastMonth } =
    getLastMonth();
  const memberCountLastMonth = await member.count({
    where: {
      created_at: {
        [Op.between]: [startDateLastMonth, endDateLastMonth],
      },
      user_status_id: status,
    },
  });

  const { startDate, endDate } = getThisMonth();
  const memberCountThisMonth = await member.count({
    where: {
      created_at: {
        [Op.between]: [startDate, endDate],
      },
      user_status_id: status,
    },
  });

  // Hitung pertumbuhan persentase
  const growthPercentage =
    memberCountLastMonth > 0
      ? ((memberCountThisMonth - memberCountLastMonth) / memberCountLastMonth) *
        100
      : 100; // Jika bulan lalu tidak ada anggota, bisa anggap pertumbuhan 100%

  return growthPercentage;
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
  getAllWithoutPaging,
  getTotalBonusByStatusOrder,
  getTotalDownlineByParentIdAndStatus,
  getMemberDirectDownlineWithTotal,
  rekapMemberByStatus,
  getDownlineMemberWithSelf,
  updateMember,
  getRekapMemberByParentId,
  getRekapAllMember,
  getRekapMemberGrowthByStatus,
};
