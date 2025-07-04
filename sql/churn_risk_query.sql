WITH ranked_admins AS (
  SELECT
    *,
    ROW_NUMBER() OVER (PARTITION BY company_id ORDER BY last_login DESC) AS rn
  FROM
    admin_users 
)
SELECT
  *
FROM
  companies c 
LEFT JOIN ranked_admins ca ON c.company_id = ca.company_id AND ca.rn = 1
WHERE
  DATEDIFF(CURDATE(), ca.last_login) > 30
  AND STR_TO_DATE(c.contract_expiration, '%Y%m%d') >= CURDATE() 
ORDER BY
  ca.last_login DESC;
