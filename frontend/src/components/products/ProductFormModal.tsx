import React from 'react';
import type { CommodityGroup, CommodityType, Country, QualityStandard, Unit } from '../../types';
import { getProductImageUrl } from '../../utils/productUtils';

interface ProductFormModalProps {
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  categories: CommodityGroup[];
  units: Unit[];
  countries: Country[];
  standards: QualityStandard[];
  filteredTypesForForm: CommodityType[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAuthorizedToApprove: boolean;
}

export default function ProductFormModal({
  onClose,
  onSave,
  form,
  setForm,
  categories,
  units,
  countries,
  standards,
  filteredTypesForForm,
  fileInputRef,
  handleImageChange,
  isAuthorizedToApprove,
}: ProductFormModalProps) {
  const isReadOnly = !!form.id && (form.approvalStatus === 'APPROVED' || form.status === 'ACTIVE');

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '650px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          animation: 'scaleUp 0.2s ease-out',
          margin: '20px',
          padding: 0,
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', padding: '16px 24px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
            {form.id ? '📝 Sửa mặt hàng hàng hóa' : '➕ Thêm hàng hóa mới'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px'
            }}
          >
            ✖️
          </button>
        </div>

        <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', margin: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Dropdown selectors row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Nhóm mặt hàng <span style={{ color: 'var(--danger)' }}>*</span></label>
                <select
                  className="input"
                  value={form.groupId}
                  onChange={(e) => setForm({ ...form, groupId: e.target.value, typeId: '' })}
                  disabled={isReadOnly}
                  style={isReadOnly ? { backgroundColor: 'var(--bg-hover)', cursor: 'not-allowed' } : {}}
                >
                  <option value="">-- Chọn Nhóm --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.groupName} ({c.groupCode})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Loại mặt hàng <span style={{ color: 'var(--danger)' }}>*</span></label>
                <select
                  className="input"
                  value={form.typeId}
                  onChange={(e) => setForm({ ...form, typeId: e.target.value })}
                  disabled={isReadOnly || !form.groupId}
                  style={(isReadOnly || !form.groupId) ? { backgroundColor: 'var(--bg-hover)', cursor: 'not-allowed' } : {}}
                >
                  <option value="">-- Chọn Loại --</option>
                  {filteredTypesForForm.map(t => (
                    <option key={t.id} value={t.id}>{t.typeName} ({t.typeCode})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Đơn vị tính <span style={{ color: 'var(--danger)' }}>*</span></label>
                <select
                  className="input"
                  value={form.unitId}
                  onChange={(e) => setForm({ ...form, unitId: e.target.value })}
                  disabled={isReadOnly}
                  style={isReadOnly ? { backgroundColor: 'var(--bg-hover)', cursor: 'not-allowed' } : {}}
                >
                  <option value="">-- Chọn ĐVT --</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>{u.unitName} ({u.symbol})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Code (custom part) & Name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Mã mặt hàng (Đuôi mã HS) <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  type="text"
                  className="input"
                  required
                  value={form.itemCode}
                  onChange={(e) => setForm({ ...form, itemCode: e.target.value.trim().toUpperCase() })}
                  placeholder="Ví dụ: 001"
                  disabled={isReadOnly}
                  style={isReadOnly ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
                />
                <div style={{ fontSize: '11px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                  <span>Mã HS dự kiến: </span>
                  <strong style={{ color: 'var(--primary)' }}>
                    {(() => {
                      const selGroup = categories.find(c => Number(c.id) === Number(form.groupId));
                      const selType = filteredTypesForForm.find(t => Number(t.id) === Number(form.typeId));
                      return `${selGroup?.groupCode || '????'}.${selType?.typeCode || '???'}.${form.itemCode || '???'}`;
                    })()}
                  </strong>
                </div>
              </div>
              <div className="form-group">
                <label>Tên mặt hàng <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  type="text"
                  className="input"
                  required
                  value={form.commodityName}
                  onChange={(e) => setForm({ ...form, commodityName: e.target.value })}
                  placeholder="Ví dụ: Tai nghe Sony WH-1000XM5"
                  disabled={isReadOnly}
                  style={isReadOnly ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
                />
              </div>
            </div>

            {/* Image section */}
            <div className="form-group">
              <label>Hình ảnh sản phẩm</label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img
                  src={getProductImageUrl(form.imageUrl)}
                  alt="Preview"
                  style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-hover)' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/image.png'; }}
                />
                {!isReadOnly && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      style={{ fontSize: '13px' }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Chọn tệp ảnh (.png, .jpg, .jpeg)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Junction list row (Countries & Standards) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Quốc gia đối tác</label>
                <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: isReadOnly ? 'var(--bg-hover)' : 'transparent' }}>
                  {countries.length === 0 ? (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Không có quốc gia hoạt động.</span>
                  ) : (
                    countries.map(c => (
                      <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isReadOnly ? 'not-allowed' : 'pointer', fontSize: '13px', margin: 0 }}>
                        <input
                          type="checkbox"
                          disabled={isReadOnly}
                          checked={form.countryIds.includes(c.id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setForm((prev: any) => ({
                              ...prev,
                              countryIds: checked ? [...prev.countryIds, c.id] : prev.countryIds.filter((id: number) => id !== c.id)
                            }));
                          }}
                        />
                        <span>{c.countryName} ({c.isoCode})</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Tiêu chuẩn chất lượng</label>
                <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: isReadOnly ? 'var(--bg-hover)' : 'transparent' }}>
                  {standards.length === 0 ? (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Không có tiêu chuẩn hoạt động.</span>
                  ) : (
                    standards.map(s => (
                      <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isReadOnly ? 'not-allowed' : 'pointer', fontSize: '13px', margin: 0 }}>
                        <input
                          type="checkbox"
                          disabled={isReadOnly}
                          checked={form.qualityStandardIds.includes(s.id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setForm((prev: any) => ({
                              ...prev,
                              qualityStandardIds: checked ? [...prev.qualityStandardIds, s.id] : prev.qualityStandardIds.filter((id: number) => id !== s.id)
                            }));
                          }}
                        />
                        <span>{s.standardName} ({s.standardCode})</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Mô tả chi tiết</label>
              <textarea
                className="input"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả các thông số kỹ thuật, đặc điểm sản phẩm..."
                disabled={isReadOnly}
                style={isReadOnly ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
              />
              {isReadOnly && (
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                  ⚠️ Chỉ cho phép sửa đổi thông tin khi trạng thái phê duyệt khác 'Đã duyệt' và trạng thái hoạt động là 'Ngừng hoạt động'.
                </span>
              )}
            </div>
          </div>

          {/* Status and Approval Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '0 24px 20px 24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <div className="form-group">
              <label>Trạng thái hoạt động</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                disabled={form.approvalStatus !== 'APPROVED' || !isAuthorizedToApprove}
                style={form.approvalStatus !== 'APPROVED' || !isAuthorizedToApprove ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
              >
                <option value="INACTIVE">Ngừng hoạt động</option>
                {form.approvalStatus === 'APPROVED' && (
                  <option value="ACTIVE">Hoạt động</option>
                )}
              </select>
              {form.approvalStatus !== 'APPROVED' && (
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                  ⚠️ Cần có phê duyệt 'Đã duyệt' để kích hoạt.
                </span>
              )}
              {!isAuthorizedToApprove && (
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                  ⚠️ Yêu cầu Quản lý/Admin thay đổi hoạt động.
                </span>
              )}
            </div>

            <div className="form-group">
              <label>Trạng thái phê duyệt</label>
              {form.id ? (
                isAuthorizedToApprove ? (
                  <select
                    className="input"
                    value={form.approvalStatus}
                    onChange={(e) => setForm({ ...form, approvalStatus: e.target.value })}
                    disabled={form.status === 'ACTIVE'}
                    style={form.status === 'ACTIVE' ? { backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' } : {}}
                  >
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="REJECTED">Từ chối</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    className="input"
                    value={
                      form.approvalStatus === 'APPROVED' ? 'Đã duyệt' :
                        form.approvalStatus === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'
                    }
                    disabled
                    style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                  />
                )
              ) : (
                <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-hover)', borderRadius: '6px', color: 'var(--warning)', fontWeight: '600', fontSize: '12px' }}>
                  ⏳ Chờ duyệt (Tạo mới cần phê duyệt)
                </div>
              )}
              {form.status === 'ACTIVE' && (
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                  ⚠️ Cần tắt trạng thái 'Hoạt động' trước khi thay đổi phê duyệt.
                </span>
              )}
            </div>
          </div>

          {/* Actions Footer */}
          <div style={{ display: 'flex', gap: '12px', padding: '16px 24px', borderTop: '1px solid var(--border-color)', justifyContent: 'flex-end', backgroundColor: 'var(--bg-hover)' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ minWidth: '100px' }}>Hủy</button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '120px' }}>{form.id ? 'Cập nhật' : 'Thêm mới'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
