"use client";
import { Area,AreaChart,CartesianGrid,ResponsiveContainer,Tooltip,XAxis,YAxis } from "recharts";
export function PerformanceChart({data}:{data:{label:string;value:number}[]}){
  if(!data.length)return null;
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{left:-20,right:8,top:12,bottom:0}}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill:"#64748b",fontSize:12}}/>
          <YAxis domain={[0,100]} axisLine={false} tickLine={false} tick={{fill:"#64748b",fontSize:12}}/>
          <Tooltip contentStyle={{borderRadius:10,border:"1px solid #e2e8f0",boxShadow:"0 4px 6px -1px rgba(0,0,0,0.05)"}} formatter={(value)=>[`${value}%`,"Orta nəticə"]}/>
          <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2.5} fill="#eef2ff" fillOpacity={0.6} activeDot={{r:5,strokeWidth:2,stroke:"#ffffff",fill:"#4f46e5"}}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
