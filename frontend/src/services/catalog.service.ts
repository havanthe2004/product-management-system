import api from './api';
import type { BaseResponse, Commodity, CommodityGroup, CommodityType, Country, QualityStandard, Unit } from '../types';

export async function getCommodityGroups(params?: any): Promise<BaseResponse<CommodityGroup[]>> {
  const res = await api.get<BaseResponse<CommodityGroup[]>>('/commodity-groups', { params });
  return res.data;
}

export async function getCommodityTypes(params?: any): Promise<BaseResponse<CommodityType[]>> {
  const res = await api.get<BaseResponse<CommodityType[]>>('/commodity-types', { params });
  return res.data;
}

export async function getCountries(params?: any): Promise<BaseResponse<Country[]>> {
  const res = await api.get<BaseResponse<Country[]>>('/countries', { params });
  return res.data;
}

export async function getQualityStandards(params?: any): Promise<BaseResponse<QualityStandard[]>> {
  const res = await api.get<BaseResponse<QualityStandard[]>>('/quality-standards', { params });
  return res.data;
}

export async function getUnits(params?: any): Promise<BaseResponse<Unit[]>> {
  const res = await api.get<BaseResponse<Unit[]>>('/units', { params });
  return res.data;
}

export async function getCommodities(params?: any): Promise<BaseResponse<Commodity[]>> {
  const res = await api.get<BaseResponse<Commodity[]>>('/commodities', { params });
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

export async function getTrashCatalog(endpoint: string, params?: any): Promise<BaseResponse<any[]>> {
  const res = await api.get<BaseResponse<any[]>>(`/${endpoint}/trash`, { params });
  return res.data;
}

export async function restoreCatalog(endpoint: string, id: number): Promise<BaseResponse<any>> {
  const res = await api.post<BaseResponse<any>>(`/${endpoint}/${id}/restore`);
  return res.data;
}

export async function getDashboardStats(): Promise<BaseResponse<{
  stats: {
    totalCommodities: number;
    activeCommodities: number;
    pendingCommodities: number;
    inactiveCommodities: number;
    totalGroups: number;
    totalTypes: number;
    totalCountries: number;
    totalStandards: number;
  };
  commoditiesByGroup: Array<{
    groupId: number;
    groupCode: string;
    groupName: string;
    count: number;
  }>;
  topCountries: Array<{
    countryId: number;
    countryName: string;
    isoCode: string;
    count: number;
  }>;
  topProductsByMarkets: Array<{
    id: number;
    commodityCode: string;
    commodityName: string;
    type: { typeName: string } | null;
    group: { groupName: string } | null;
    countries: Array<{ countryName: string }>;
  }>;
}>> {
  const res = await api.get<BaseResponse<any>>('/dashboard/stats');
  return res.data;
}
