import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AiAdvisorRequest {
  client_name: string;
  montant: number;
  statut: string;
  notes?: string;
}

export interface AiAdvisorResponse {
  summary: string;
  recommendation: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiAdvisorService {
  private readonly apiUrl = environment.aiAdvisorUrl;

  constructor(private http: HttpClient) {}

  adviseOpportunity(
    opportunity: AiAdvisorRequest
  ): Observable<AiAdvisorResponse> {
    return this.http.post<AiAdvisorResponse>(
      `${this.apiUrl}/advise-opportunity`,
      opportunity
    );
  }
}