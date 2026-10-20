import { Injectable } from '@nestjs/common';
import { ClockService } from '../common/clock.service';
import { diffDays } from '../common/date.utils';
import { DataService } from '../data/data.service';
import { DocumentStatus, DocumentsResponseDto } from './dto/documents.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly data: DataService,
    private readonly clock: ClockService,
  ) {}

  getDocuments(): DocumentsResponseDto {
    const { thresholds, documents } = this.data.documents;
    return {
      items: documents.map(({ id, label, expiryDate }) => {
        const daysRemaining = diffDays(this.clock.today, expiryDate);
        return {
          id,
          name: label,
          expiryDate,
          daysRemaining,
          status: this.classifyStatus(daysRemaining, thresholds.warningDays),
        };
      }),
    };
  }

  classifyStatus(daysRemaining: number, warningDays: number): DocumentStatus {
    if (daysRemaining <= 0) return 'expired';
    return daysRemaining <= warningDays ? 'soon' : 'safe';
  }
}
