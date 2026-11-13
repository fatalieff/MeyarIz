export type RankedResult = { studentId:string; fullName:string; scores:number[] };
export type RankingRow = RankedResult & { average:number; rank:number; provisional:boolean };
export function rankStudents(rows:RankedResult[], limit=3, minimum=2):RankingRow[] {
  const computed = rows.map(row => { const scores=row.scores.slice(-limit); return {...row,scores,average:scores.reduce((a,b)=>a+b,0)/scores.length,provisional:scores.length<minimum}; }).filter(r=>r.scores.length);
  computed.sort((a,b)=>b.average-a.average || a.fullName.localeCompare(b.fullName,"az"));
  let prior:number|undefined; let rank=0;
  return computed.map((row,index)=>{ if(prior===undefined || Math.abs(prior-row.average)>.0001) rank=index+1; prior=row.average; return {...row,rank}; });
}
