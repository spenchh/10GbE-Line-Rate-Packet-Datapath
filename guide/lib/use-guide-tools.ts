'use client';
import { useEffect } from 'react';
import { lookupMilestone } from './guide-tool';

type ModelContext = { registerTool(tool: { name:string; title:string; description:string; inputSchema:object; annotations:{readOnlyHint:boolean;untrustedContentHint:boolean}; execute(input:unknown):unknown }, options:{signal:AbortSignal}):void|Promise<void> };
export function useGuideTools() {
  useEffect(() => {
    const context=(document as Document & {modelContext?:ModelContext}).modelContext;
    if (!context?.registerTool) return;
    const lifecycle=new AbortController();
    try {
      void Promise.resolve(context.registerTool({
        name:'read_fpga_milestone',title:'Read FPGA milestone',
        description:'Read one planned milestone, its build steps, evidence gate and source highlights from this guide. Does not mark work complete or execute RTL.',
        inputSchema:{type:'object',properties:{milestoneId:{type:'string',enum:Array.from({length:11},(_,i)=>`p${i+1}`)}},required:['milestoneId'],additionalProperties:false},
        annotations:{readOnlyHint:true,untrustedContentHint:false},execute:lookupMilestone,
      },{signal:lifecycle.signal})).catch(error=>console.warn('Guide tool registration unavailable',error));
    } catch(error) { console.warn('Guide tool registration unavailable',error); }
    return()=>lifecycle.abort();
  },[]);
}
