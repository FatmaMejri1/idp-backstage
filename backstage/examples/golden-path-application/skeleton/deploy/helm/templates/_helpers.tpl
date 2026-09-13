{{/*
Expand the name of the chart.
*/}}
{{- define "golden-path-application.name" -}}
{{- .Values.name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a fully qualified name.
*/}}
{{- define "golden-path-application.fullname" -}}
{{- .Values.name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels.
*/}}
{{- define "golden-path-application.labels" -}}
app.kubernetes.io/name: {{ include "golden-path-application.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: {{ include "golden-path-application.name" . }}
{{- end }}
