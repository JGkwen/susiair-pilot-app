import { DataService } from '../data/data.service';
import { DocumentsService } from './documents.service';

describe('DocumentsService', () => {
  const service = new DocumentsService(new DataService(), {
    today: '2026-05-15',
  });

  it.each([
    [-1, 'expired'],
    [0, 'expired'],
    [1, 'soon'],
    [30, 'soon'],
    [31, 'safe'],
  ])('classifies %i days remaining as %s', (daysRemaining, status) => {
    expect(service.classifyStatus(daysRemaining, 30)).toBe(status);
  });

  it('returns each document with days remaining and status as of today', () => {
    expect(service.getDocuments().items).toEqual([
      {
        id: 'doc_recurrent',
        name: 'Next Recurrent Date',
        expiryDate: '2026-10-14',
        daysRemaining: 152,
        status: 'safe',
      },
      {
        id: 'doc_ppc',
        name: 'PPC Exp. Date',
        expiryDate: '2026-12-25',
        daysRemaining: 224,
        status: 'safe',
      },
      {
        id: 'doc_license',
        name: 'Indonesian License Exp. Date',
        expiryDate: '2026-05-29',
        daysRemaining: 14,
        status: 'soon',
      },
      {
        id: 'doc_medical',
        name: 'Indonesian Medical Exp. Date',
        expiryDate: '2026-06-11',
        daysRemaining: 27,
        status: 'soon',
      },
      {
        id: 'doc_security',
        name: 'Security Clearance Exp. Date',
        expiryDate: '2026-05-01',
        daysRemaining: -14,
        status: 'expired',
      },
    ]);
  });
});
