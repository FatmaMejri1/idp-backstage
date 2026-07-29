import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Opportunite } from '../models/opportunite.model';

@Injectable({
  providedIn: 'root'
})
export class OpportuniteService {
  private apiUrl = 'http://localhost:8081/api/opportunites';

  constructor(private http: HttpClient) {}

  getAllOpportunites(): Observable<Opportunite[]> {
    return this.http.get<Opportunite[]>(this.apiUrl);
  }

  getOpportuniteById(id: number): Observable<Opportunite> {
    return this.http.get<Opportunite>(`${this.apiUrl}/${id}`);
  }

  createOpportunite(opp: Opportunite): Observable<Opportunite> {
    return this.http.post<Opportunite>(this.apiUrl, opp);
  }

  updateOpportunite(id: number, opp: Opportunite): Observable<Opportunite> {
    return this.http.put<Opportunite>(`${this.apiUrl}/${id}`, opp);
  }

  deleteOpportunite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
