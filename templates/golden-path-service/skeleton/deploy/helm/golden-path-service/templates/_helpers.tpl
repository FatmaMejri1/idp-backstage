{{/*
Expand the name of the chart.
*/}}
{{- define "golden-path-service.name" -}}
{{- .Values.name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a fully qualified name.
*/}}
{{- define "golden-path-service.fullname" -}}
{{- .Values.name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels.
*/}}
{{- define "golden-path-service.labels" -}}
app.kubernetes.io/name: {{ include "golden-path-service.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
