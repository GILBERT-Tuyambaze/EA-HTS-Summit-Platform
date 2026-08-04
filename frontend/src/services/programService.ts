export type SpeakerRecord={id:string;name:string;organization:string;email:string;biography:string;image:string|null};
export type SpeakerInput=Omit<SpeakerRecord,'id'>;
export type SessionRecord = {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  track: string;
  speakerId: string | null;
  speakerIds: string[];
  speakerName: string;
  speakerNames: string[];
};
export type SessionInput = Omit<SessionRecord, 'id' | 'speakerName' | 'speakerNames' | 'speakerIds'> & { speakerIds?: string[] | null };
const base=import.meta.env.VITE_API_BASE_URL || '/api';const token=()=>typeof window==='undefined'?null:sessionStorage.getItem('eahts-admin-token');
async function request<T>(path:string,init?:RequestInit):Promise<T>{const r=await fetch(`${base}${path}`,{...init,headers:{'Content-Type':'application/json',...(token()?{Authorization:`Bearer ${token()}`} : {}),...(init?.headers??{})}});if(!r.ok){const b=await r.json().catch(()=>({}));throw new Error(b.message||'Request failed.')}return r.status===204?undefined as T:r.json() as Promise<T>}
const mapSpeaker=(x:Record<string,unknown>):SpeakerRecord=>({id:String(x.id??''),name:String(x.name??''),organization:String(x.organization??''),email:String(x.email??''),biography:String(x.biography??x.bio??''),image:x.image??x.photo?String(x.image??x.photo):null});
const mapSession = (x: Record<string, any>): SessionRecord => {
  const speakers = Array.isArray(x.speakers) ? x.speakers : [];
  const speakerIds = speakers.map((s: any) => String(s.id));
  const speakerNames = speakers.map((s: any) => String(s.name));
  return {
    id: String(x.id ?? ''),
    title: String(x.title ?? ''),
    description: String(x.description ?? ''),
    date: String(x.date ?? ''),
    startTime: String(x.start_time ?? ''),
    endTime: String(x.end_time ?? ''),
    location: String(x.location ?? x.room ?? ''),
    track: String(x.track ?? ''),
    speakerId: x.speaker_id ? String(x.speaker_id) : null,
    speakerIds,
    speakerName: String(speakerNames.join(', ')),
    speakerNames,
  };
};
const normaliseArray = <T>(value: unknown): T[] => Array.isArray(value) ? (value as T[]) : [];
const normaliseStats = (value: unknown) => {
  const stats = (value && typeof value === 'object') ? value as Record<string, unknown> : {};
  return {
    sessions: Number(stats.sessions ?? 0),
    speakers: Number(stats.speakers ?? 0),
    tracks: Number(stats.tracks ?? 0),
    rooms: Number(stats.rooms ?? 0),
  };
};
export async function getProgram() {
  const r = await request<{ sessions?: Record<string, any>[]; speakers?: Record<string, unknown>[]; stats?: { sessions: number; speakers: number; tracks: number; rooms: number } }>('/admin/program');
  return {
    sessions: normaliseArray<Record<string, any>>(r?.sessions).map(mapSession),
    speakers: normaliseArray<Record<string, unknown>>(r?.speakers).map(mapSpeaker),
    stats: normaliseStats(r?.stats),
  };
}

export async function createSession(x: SessionInput) {
  return mapSession(
    await request<Record<string, any>>('/admin/program/sessions', {
      method: 'POST',
      body: JSON.stringify({
        title: x.title,
        description: x.description || null,
        date: x.date,
        start_time: x.startTime,
        end_time: x.endTime,
        location: x.location,
        track: x.track,
        speaker_ids: x.speakerIds ?? (x.speakerId ? [x.speakerId] : []),
      }),
    })
  );
}

export async function updateSession(id: string, x: Partial<SessionInput>) {
  return mapSession(
    await request<Record<string, any>>(`/admin/program/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: x.title,
        description: x.description,
        date: x.date,
        start_time: x.startTime,
        end_time: x.endTime,
        location: x.location,
        track: x.track,
        speaker_ids: x.speakerIds ?? (x.speakerId ? [x.speakerId] : undefined),
      }),
    })
  );
}
export const deleteSession=(id:string)=>request<void>(`/admin/program/sessions/${id}`,{method:'DELETE'});
export async function createSpeaker(x:SpeakerInput){return mapSpeaker(await request<Record<string,unknown>>('/admin/program/speakers',{method:'POST',body:JSON.stringify(x)}));}
export async function updateSpeaker(id:string,x:Partial<SpeakerInput>){return mapSpeaker(await request<Record<string,unknown>>(`/admin/program/speakers/${id}`,{method:'PATCH',body:JSON.stringify(x)}));}
export const deleteSpeaker=(id:string)=>request<void>(`/admin/program/speakers/${id}`,{method:'DELETE'});
