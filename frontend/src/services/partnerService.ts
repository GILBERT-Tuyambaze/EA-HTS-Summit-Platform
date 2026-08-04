export type PartnerStatus = 'Pending' | 'Confirmed' | 'Rejected';
export type AgreementStatus = 'draft' | 'sent' | 'signed' | 'expired';
export type PartnerRecord = { id:string; company:string; category:string; contactPerson:string; email:string; phone:string; country:string; status:PartnerStatus; agreementStatus:AgreementStatus; logo?:string | null; details?: string | null; createdAt:string };
export type PartnerInput = Omit<PartnerRecord, 'id'|'createdAt'>;
const base=import.meta.env.VITE_API_BASE_URL || '/api';
const token=()=>typeof window==='undefined'?null:sessionStorage.getItem('eahts-admin-token');
async function request<T>(path:string,init?:RequestInit):Promise<T>{const r=await fetch(`${base}${path}`,{...init,headers:{'Content-Type':'application/json',...(token()?{Authorization:`Bearer ${token()}`} : {}),...(init?.headers??{})}});if(!r.ok){const body=await r.json().catch(()=>({}));throw new Error(body.message||'Request failed.')}return r.status===204?undefined as T:r.json() as Promise<T>}
const map=(x:Record<string,unknown>):PartnerRecord=>({id:String(x.id??''),company:String(x.company??x.organization??''),category:String(x.category??x.level??''),contactPerson:String(x.contact_person??''),email:String(x.email??''),phone:String(x.phone??''),country:String(x.country??''),status:(x.status==='Confirmed'||x.status==='Rejected'||x.status==='Pending'?x.status:'Pending') as PartnerStatus,agreementStatus:(x.agreement_status??'draft') as AgreementStatus,logo:x.logo?String(x.logo):null,details:x.details?String(x.details):null,createdAt:String(x.created_at??'')});
const payload=(x:Partial<PartnerInput>)=>({company:x.company,category:x.category,contact_person:x.contactPerson,email:x.email,phone:x.phone||null,country:x.country||null,status:x.status,agreement_status:x.agreementStatus,logo:x.logo||null,details:x.details||null});
export async function getPartners(){const r=await request<{partners:Record<string,unknown>[];stats:{total:number;confirmed:number;pending:number;partnerValue:number}}>('/admin/partners');return {partners:r.partners.map(map),stats:r.stats}}
export const listPartners=async()=> (await getPartners()).partners;
export async function getPartner(id:string){return map(await request<Record<string,unknown>>(`/admin/partners/${id}`));}
export async function createPartner(input:PartnerInput){return map(await request<Record<string,unknown>>('/admin/partners',{method:'POST',body:JSON.stringify(payload(input))}));}
export async function updatePartner(id:string,input:Partial<PartnerInput>){return map(await request<Record<string,unknown>>(`/admin/partners/${id}`,{method:'PATCH',body:JSON.stringify(payload(input))}));}
export async function updatePartnerStatus(id:string,status:PartnerStatus){return map(await request<Record<string,unknown>>(`/admin/partners/${id}/status`,{method:'PATCH',body:JSON.stringify({status})}));}
export async function deletePartner(id:string){return request<void>(`/admin/partners/${id}`,{method:'DELETE'});}
