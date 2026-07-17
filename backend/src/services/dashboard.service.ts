import { CommodityRepository } from "../repositories/commodity.repository";
import { CommodityGroupRepository } from "../repositories/commodity-group.repository";
import { CommodityTypeRepository } from "../repositories/commodity-type.repository";
import { CountryRepository } from "../repositories/country.repository";
import { QualityStandardRepository } from "../repositories/quality-standard.repository";
import { CommodityStatus } from "../common/enums/commodity-status.enum";
import { CommodityApprovalStatus } from "../common/enums/commodity-approval-status.enum";

export class DashboardService {
  private commodityRepository = CommodityRepository;
  private groupRepository = CommodityGroupRepository;
  private typeRepository = CommodityTypeRepository;
  private countryRepository = CountryRepository;
  private standardRepository = QualityStandardRepository;

  async getStats(): Promise<any> {
    const [
      totalCommodities,
      activeCommodities,
      pendingCommodities,
      inactiveCommodities,
      totalGroups,
      totalTypes,
      totalCountries,
      totalStandards
    ] = await Promise.all([
      this.commodityRepository.count(),
      this.commodityRepository.count({ where: { status: CommodityStatus.ACTIVE } }),
      this.commodityRepository.count({ where: { approvalStatus: CommodityApprovalStatus.PENDING } }),
      this.commodityRepository.count({ where: { status: CommodityStatus.INACTIVE } }),
      this.groupRepository.count(),
      this.typeRepository.count(),
      this.countryRepository.count(),
      this.standardRepository.count()
    ]);

    // Fetch active commodities with relations for grouping & ranking
    const activeList = await this.commodityRepository.find({
      where: { status: CommodityStatus.ACTIVE },
      relations: {
        group: true,
        type: true,
        countries: true
      }
    });

    const groups = await this.groupRepository.find();
    const countries = await this.countryRepository.find();

    // 1. Commodities by group
    const commoditiesByGroup = groups.map(g => {
      const count = activeList.filter(c => c.group?.id === g.id).length;
      return {
        groupId: g.id,
        groupCode: g.groupCode,
        groupName: g.groupName,
        count
      };
    });

    // 2. Export market stats (Top 10 countries with most active commodities)
    const countryCounts = countries.map(country => {
      const count = activeList.filter(c => c.countries?.some(ct => ct.id === country.id)).length;
      return {
        countryId: country.id,
        countryName: country.countryName,
        isoCode: country.isoCode || 'N/A',
        count
      };
    });

    const topCountries = countryCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 3. Top 10 active products with the most export markets
    const topProductsByMarkets = [...activeList]
      .sort((a, b) => (b.countries?.length || 0) - (a.countries?.length || 0))
      .slice(0, 10)
      .map(c => ({
        id: c.id,
        commodityCode: c.commodityCode,
        commodityName: c.commodityName,
        type: c.type ? { typeName: c.type.typeName } : null,
        group: c.group ? { groupName: c.group.groupName } : null,
        countries: c.countries ? c.countries.map(ct => ({ countryName: ct.countryName })) : []
      }));

    return {
      stats: {
        totalCommodities,
        activeCommodities,
        pendingCommodities,
        inactiveCommodities,
        totalGroups,
        totalTypes,
        totalCountries,
        totalStandards
      },
      commoditiesByGroup,
      topCountries,
      topProductsByMarkets
    };
  }
}

export const dashboardService = new DashboardService();
