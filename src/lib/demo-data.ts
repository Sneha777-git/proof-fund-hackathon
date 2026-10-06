import ai from '@/assets/campaign-ai.jpg';
import water from '@/assets/campaign-water.jpg';
import solar from '@/assets/campaign-solar.jpg';
export const campaigns = [
 {id:'open-source-ai',title:'Open Source AI Lab',description:'Making medical intelligence accessible to everyone.',creator:'Aarav Mehta',category:'Technology',image:ai,goal:1000000,raised:840000,verified:3,total:5,deadline:'Nov 24, 2026',days:49,status:'Verified',current:'Beta launch'},
 {id:'clean-water',title:'Clean Water, Shared Futures',description:'Safe drinking water for 12 rural communities.',creator:'Jal Collective',category:'Community',image:water,goal:750000,raised:562500,verified:2,total:4,deadline:'Dec 08, 2026',days:63,status:'Verified',current:'Water quality testing'},
 {id:'solar-schools',title:'A Brighter Future for Schools',description:'Powering classrooms with community-owned solar.',creator:'Sunrise Foundation',category:'Climate',image:solar,goal:1200000,raised:648000,verified:1,total:5,deadline:'Nov 12, 2026',days:37,status:'In review',current:'Equipment procurement'},
];
export type Campaign = typeof campaigns[number];
export const money = (n:number) => '₹'+n.toLocaleString('en-IN');
export const compactMoney = (n:number) => n>=10000000 ? '₹'+(n/10000000).toFixed(1)+'Cr' : n>=100000 ? '₹'+(n/100000).toFixed(1)+'L' : money(n);
export const milestones = [
 {id:'research',name:'Research & planning',description:'Community research, feasibility study and implementation plan.',amount:150000,status:'Released',deadline:'Sep 02, 2026'},
 {id:'prototype',name:'Prototype development',description:'Working prototype with documented test results.',amount:200000,status:'Released',deadline:'Sep 28, 2026'},
 {id:'beta',name:'Beta launch',description:'Public beta with independent evaluation and user feedback.',amount:180000,status:'Voting open',deadline:'Oct 18, 2026'},
 {id:'production',name:'Production rollout',description:'Production infrastructure, safety review and deployment.',amount:210000,status:'Locked',deadline:'Nov 10, 2026'},
 {id:'impact',name:'Impact assessment',description:'Final impact report and transparent utilization statement.',amount:260000,status:'Locked',deadline:'Nov 24, 2026'},
];
export const protocolSteps=['Donation','Escrow','Milestone','Proof','Verification','Approval','Release'];
export const integrityNote='Hash verification confirms that the referenced document has not changed. It does not independently prove that the claims inside the document are true.';
