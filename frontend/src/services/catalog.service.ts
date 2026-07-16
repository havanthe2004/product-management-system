import api from './api';
import type { BaseResponse, Commodity, CommodityGroup, CommodityType, Country, QualityStandard, Unit } from '../types';

export async function getCommodityGroups(): Promise<BaseResponse<CommodityGroup[]>> {
  const res = await api.get<BaseResponse<CommodityGroup[]>>('/commodity-groups');
  return res.data;
}

export async function getCommodityTypes(): Promise<BaseResponse<CommodityType[]>> {
  const res = await api.get<BaseResponse<CommodityType[]>>('/commodity-types');
  return res.data;
}

export async function getCountries(): Promise<BaseResponse<Country[]>> {
  const res = await api.get<BaseResponse<Country[]>>('/countries');
  return res.data;
}

export async function getQualityStandards(): Promise<BaseResponse<QualityStandard[]>> {
  const res = await api.get<BaseResponse<QualityStandard[]>>('/quality-standards');
  return res.data;
}

export async function getUnits(): Promise<BaseResponse<Unit[]>> {
  const res = await api.get<BaseResponse<Unit[]>>('/units');
  return res.data;
}

export async function getCommodities(): Promise<BaseResponse<Commodity[]>> {
  const res = await api.get<BaseResponse<Commodity[]>>('/commodities');
  return res.data;
}

export async function saveCatalog(endpoint: string, data: any): Promise<BaseResponse<any>> {
  if (data.id) {
    const res = await api.put<BaseResponse<any>>(`/${endpoint}/${data.id}`, data);
    return res.data;
  } else {
    const res = await api.post<BaseResponse<any>>(`/${endpoint}`, data);
    return res.data;
  }
}

export async function deleteCatalog(endpoint: string, id: number): Promise<BaseResponse<any>> {
  const res = await api.delete<BaseResponse<any>>(`/${endpoint}/${id}`);
  return res.data;
}

export async function getTrashCatalog(endpoint: string): Promise<BaseResponse<any[]>> {
  const res = await api.get<BaseResponse<any[]>>(`/${endpoint}/trash`);
  return res.data;
}

export async function restoreCatalog(endpoint: string, id: number): Promise<BaseResponse<any>> {
  const res = await api.post<BaseResponse<any>>(`/${endpoint}/${id}/restore`);
  return res.data;
}
