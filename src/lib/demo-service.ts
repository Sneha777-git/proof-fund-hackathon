// Frontend-only service boundary. No wallet signing, network transaction or IPFS claims.
export async function hashDocument(file:File) {
 const digest=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());
 return Array.from(new Uint8Array(digest)).map(n=>n.toString(16).padStart(2,'0')).join('');
}
export function downloadReport() {
 const blob=new Blob(['ProofFund — DEMO REPORT\nCampaign,Raised,Released,Locked\nOpen Source AI Lab,840000,350000,490000\nClean Water Shared Futures,562500,225000,337500\nSolar Schools,648000,120000,528000\nNot connected to blockchain.'],{type:'text/csv'});
 const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url;a.download='prooffund-demo-report.csv';a.click();URL.revokeObjectURL(url);
}
