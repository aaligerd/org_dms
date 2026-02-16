

function getDateAfter3Days() {
  const now = new Date();
  const result = new Date(now);
  result.setDate(result.getDate() + 3);
  return `${result.getFullYear()}-${result.getMonth()+1}-${result.getDate()}`;
}

module.exports={getDateAfter3Days}
