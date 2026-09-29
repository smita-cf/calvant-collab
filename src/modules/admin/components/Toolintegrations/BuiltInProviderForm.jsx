// // C:\Users\user\Downloads\11-8-(A)cf_next-preprod\cf_next-preprod\cf-tool-frontend-main\src\modules\admin\components\Toolintegrations\BuiltInProviderForm.jsx
// import { useState } from "react";
// import {
//   Box,
//   TextField,
//   Button,
//   CircularProgress,
//   Alert,
//   Typography,
//   Divider,
// } from "@mui/material";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
// import WifiTetheringIcon from "@mui/icons-material/WifiTethering";
// import LinkOffIcon from "@mui/icons-material/LinkOff";
// import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

// const PROVIDERS = {
//   aws: {
//     label: "Amazon Web Services",
//     accent: "#FF9900",
//     note: "Create a cross-account IAM role that trusts CalVant, then paste the Role ARN. Your credentials are encrypted with AES-256-GCM before storage — never stored in plaintext.",
//     fields: [
//       { key: "accountId", label: "Account ID", secret: false },
//       {
//         key: "region",
//         label: "Region",
//         secret: false,
//         placeholder: "ap-south-1",
//       },
//       {
//         key: "roleArn",
//         label: "Role ARN",
//         secret: true,
//         placeholder: "arn:aws:iam::123456789012:role/CalVantReadOnly",
//       },
//       {
//         key: "evidenceBuckets",
//         label: "Evidence Buckets (comma-separated)",
//         secret: false,
//         placeholder: "bucket-1, bucket-2",
//       },
//     ],
//   },
//   gws: {
//     label: "Google Workspace",
//     accent: "#4285F4",
//     note: "Create a GCP service account with domain-wide delegation enabled, then paste the full JSON key below.",
//     fields: [
//       {
//         key: "domain",
//         label: "Domain",
//         secret: false,
//         placeholder: "yourcompany.com",
//       },
//       {
//         key: "customerId",
//         label: "Customer ID",
//         secret: false,
//         placeholder: "C0xxxxxxx",
//       },
//       {
//         key: "adminUser",
//         label: "Admin User Email",
//         secret: false,
//         placeholder: "admin@yourcompany.com",
//       },
//       {
//         key: "serviceAccountJson",
//         label: "Service Account JSON",
//         secret: true,
//         multiline: true,
//       },
//     ],
//   },
//   m365: {
//     label: "Microsoft 365",
//     accent: "#0078D4",
//     note: "Register an app in Azure AD, grant it Microsoft Graph read permissions, then paste the credentials below.",
//     fields: [
//       { key: "tenantId", label: "Azure Tenant ID", secret: false },
//       { key: "clientId", label: "Client ID", secret: false },
//       { key: "clientSecret", label: "Client Secret", secret: true },
//     ],
//   },
//   keka: {
//     label: "Keka HR",
//     accent: "#E84C3D",
//     note: "Find your credentials in Keka under Settings → Developer → API Access.",
//     fields: [
//       { key: "companyAlias", label: "Company Alias", secret: false },
//       { key: "clientId", label: "Client ID", secret: false },
//       { key: "clientSecret", label: "Client Secret", secret: true },
//       { key: "coreHrApiKey", label: "Core HR API Key", secret: true },
//       { key: "leaveApiKey", label: "Leave API Key", secret: true },
//       { key: "attendanceApiKey", label: "Attendance Key", secret: true },
//     ],
//   },
//   vault: {
//     label: "HashiCorp Vault",
//     accent: "#000000",
//     note: "Point to your self-hosted Vault instance and provide a token with read access to sys/mounts, sys/audit, and auth/token/lookup-self.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Vault Base URL",
//         secret: false,
//         placeholder: "https://vault.yourcompany.com:8200",
//       },
//       { key: "vaultToken", label: "Vault Token", secret: true },
//     ],
//   },
//   jumpcloud: {
//     label: "JumpCloud",
//     accent: "#14283D",
//     note: "Find your API key under Settings → Administrators → your profile → Enable API access.",
//     fields: [{ key: "apiKey", label: "API Key", secret: true }],
//   },
//   otx: {
//     label: "OTX AlienVault",
//     accent: "#00A8E0",
//     note: "Generate an API key from your OTX account settings page (free tier, no usage limits).",
//     fields: [{ key: "apiKey", label: "API Key", secret: true }],
//   },
//   gophish: {
//     label: "GoPhish",
//     accent: "#5D4E8C",
//     note: "Point to your self-hosted GoPhish instance and provide the Authorization API key from Settings.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "GoPhish Base URL",
//         secret: false,
//         placeholder: "https://gophish.yourcompany.com",
//       },
//       { key: "apiKey", label: "API Key", secret: true },
//     ],
//   },
//   snyk: {
//     label: "Snyk",
//     accent: "#4C4A73",
//     note: "Find your Org ID and API token under Account Settings in the Snyk dashboard.",
//     fields: [
//       { key: "orgId", label: "Organization ID", secret: false },
//       { key: "apiKey", label: "API Token", secret: true },
//     ],
//   },
//   cloudflare: {
//     label: "Cloudflare",
//     accent: "#F38020",
//     note: "Create a scoped API Token (Zone → Firewall Services, SSL and Certificates, Analytics — all Read) for your specific zone, then paste the Zone ID from your domain overview page.",
//     fields: [
//       { key: "zoneId", label: "Zone ID", secret: false },
//       { key: "apiToken", label: "API Token", secret: true },
//     ],
//   },
//   notion: {
//     label: "Notion",
//     accent: "#000000",
//     note: "Create an internal integration at notion.so/my-integrations, share the target database with it, then paste the token and database ID below.",
//     fields: [
//       { key: "databaseId", label: "Database ID", secret: false },
//       { key: "integrationToken", label: "Integration Token", secret: true },
//     ],
//   },
//   wazuh: {
//     label: "Wazuh",
//     accent: "#3253DC",
//     note: "Use your Wazuh manager URL and API credentials (default API port is 55000).",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Wazuh Base URL",
//         secret: false,
//         placeholder: "https://wazuh.yourcompany.com:55000",
//       },
//       { key: "username", label: "Username", secret: false },
//       { key: "password", label: "Password", secret: true },
//     ],
//   },
//   confluence: {
//     label: "Confluence",
//     accent: "#172B4D",
//     note: "Generate an API token from id.atlassian.com/manage-profile/security/api-tokens, then pair it with your Atlassian account email and Confluence site URL.",
//     fields: [
//       {
//         key: "siteUrl",
//         label: "Site URL",
//         secret: false,
//         placeholder: "https://yourcompany.atlassian.net",
//       },
//       {
//         key: "email",
//         label: "Atlassian Account Email",
//         secret: false,
//         placeholder: "you@yourcompany.com",
//       },
//       { key: "apiToken", label: "API Token", secret: true },
//     ],
//   },
//   pfsense: {
//     label: "pfSense",
//     accent: "#212121",
//     note: "Requires the pfSense-API community package installed on your firewall. Point to your pfSense base URL and provide the API key from your pfSense-API configuration.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "pfSense Base URL",
//         secret: false,
//         placeholder: "https://firewall.yourcompany.com",
//       },
//       { key: "apiKey", label: "API Key", secret: true },
//     ],
//   },
//   crowdstrike: {
//     label: "CrowdStrike Falcon",
//     accent: "#E01F27",
//     note: "Create an OAuth2 API client under Support and resources → API clients and keys in the Falcon console, with Hosts: Read, Vulnerabilities (Spotlight): Read, and Alerts: Read scopes. Base URL depends on your Falcon cloud region.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Falcon Base URL",
//         secret: false,
//         placeholder: "https://api.crowdstrike.com",
//       },
//       { key: "clientId", label: "Client ID", secret: false },
//       { key: "clientSecret", label: "Client Secret", secret: true },
//     ],
//   },
//   owaspzap: {
//     label: "OWASP ZAP",
//     accent: "#4B0082",
//     note: "Point to your self-hosted ZAP daemon and the API key from Tools → Options → API in the ZAP GUI. Target URL should match the site ZAP has scanned so alerts are scoped correctly.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "ZAP Base URL",
//         secret: false,
//         placeholder: "http://zap.yourcompany.com:8080",
//       },
//       { key: "apiKey", label: "API Key", secret: true },
//       {
//         key: "targetUrl",
//         label: "Target URL (scanned site)",
//         secret: false,
//         placeholder: "https://app.yourcompany.com",
//       },
//     ],
//   },
//   keycloak: {
//     label: "Keycloak",
//     accent: "#4D4D4D",
//     note: 'Create a confidential client in your realm with Service Accounts enabled, and assign it the realm-management "view-users" and "view-events" roles. Also confirm Realm Settings → Events → "Save Events" is turned on, otherwise the access-review control will always show non-compliant.',
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Keycloak Base URL",
//         secret: false,
//         placeholder: "https://auth.yourcompany.com",
//       },
//       {
//         key: "realm",
//         label: "Realm",
//         secret: false,
//         placeholder: "yourcompany",
//       },
//       { key: "clientId", label: "Client ID", secret: false },
//       { key: "clientSecret", label: "Client Secret", secret: true },
//     ],
//   },
//   paloalto: {
//     label: "Palo Alto Networks",
//     accent: "#FA582D",
//     note: "Placeholder credentials — swap the fields below once you confirm which Palo Alto API you're integrating with (PAN-OS XML/REST API key, or Cortex/Prisma OAuth2 client).",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Base URL",
//         secret: false,
//         placeholder: "https://firewall.yourcompany.com",
//       },
//       { key: "apiKey", label: "API Key", secret: true },
//     ],
//   },
//   jamfpro: {
//     label: "Jamf Pro",
//     accent: "#26A055",
//     note: "Provide your Jamf Pro Base URL, Client ID, and Client Secret with read access to the devices and configuration profiles API.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Jamf Pro Base URL",
//         secret: false,
//         placeholder: "https://yourcompany.jamfcloud.com",
//       },
//       { key: "clientId", label: "Client ID", secret: false },
//       { key: "clientSecret", label: "Client Secret", secret: true },
//     ],
//   },
//   misp: {
//     label: "MISP Threat Intelligence",
//     accent: "#A020F0",
//     note: "Provide your MISP Base URL and API Auth Key. The key must have read permissions to access events.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "MISP Base URL",
//         secret: false,
//         placeholder: "https://misp.yourcompany.com",
//       },
//       { key: "apiKey", label: "API Auth Key", secret: true },
//     ],
//   },
//   graylog: {
//     label: "Graylog",
//     accent: "#FF3633",
//     note: 'Generate a personal access token from your Graylog user profile ("Edit Tokens"), then point to the base URL of your Graylog instance (the REST API listens on the same host, typically port 9000).',
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Graylog Base URL",
//         secret: false,
//         placeholder: "https://graylog.yourcompany.com:9000",
//       },
//       { key: "apiToken", label: "API Token", secret: true },
//     ],
//   },
//   bitwarden: {
//     label: "Bitwarden Teams",
//     accent: "#175DDC",
//     note: "In your Bitwarden organization vault, go to Business Settings → API Key to generate a Client ID and Client Secret. The Organization ID is on the same page (or in the org vault URL).",
//     fields: [
//       { key: "organizationId", label: "Organization ID", secret: false },
//       { key: "clientId", label: "Client ID", secret: false },
//       { key: "clientSecret", label: "Client Secret", secret: true },
//     ],
//   },
//   teams: {
//     label: "Microsoft Teams",
//     accent: "#6264A7",
//     note: "In the target Teams channel, go to Connectors → Incoming Webhook, create one, and paste the generated webhook URL below. Compliance sync results and alerts will be posted to that channel.",
//     fields: [
//       {
//         key: "webhookUrl",
//         label: "Incoming Webhook URL",
//         secret: true,
//         placeholder: "https://yourcompany.webhook.office.com/webhookb2/...",
//       },
//     ],
//   },
//   frigate: {
//     label: "Frigate NVR",
//     accent: "#06B6D4",
//     note: 'In your Frigate config.yml, enable the built-in auth module and create a user under the "auth" section (Frigate supports running with no auth too — leave Username/Password blank if your instance is unauthenticated). Point Base URL at the host serving the Frigate web UI/API.',
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Frigate Base URL",
//         secret: false,
//         placeholder: "https://frigate.yourcompany.com",
//       },
//       { key: "username", label: "Username", secret: false },
//       { key: "password", label: "Password", secret: true },
//     ],
//   },
//   verkada: {
//     label: "Verkada",
//     accent: "#000000",
//     note: 'Generate an API key in Verkada Command under Admin → API → API Keys (read-only "Cameras" scope is sufficient). For local testing against the bundled mock server, set Base URL to http://localhost:8080/mock-verkada and use any non-empty value for the API key.',
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Base URL",
//         secret: false,
//         placeholder: "https://api.verkada.com",
//       },
//       { key: "apiKey", label: "API Key", secret: true },
//     ],
//   },
//   onepassword: {
//     label: "1Password",
//     accent: "#0C66E4",
//     note: "Provide your 1Password Connect Server URL and access token.",
//     fields: [
//       { key: "baseUrl", label: "Connect Server URL", secret: false },
//       { key: "accessToken", label: "Access Token", secret: true },
//     ],
//   },
//   servicenow: {
//     label: "ServiceNow",
//     accent: "#81B5A1",
//     note: "Provide your ServiceNow instance URL, client ID, and secret.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Instance URL",
//         secret: false,
//         placeholder: "https://dev12345.service-now.com",
//       },
//       { key: "clientId", label: "Client ID", secret: false },
//       { key: "clientSecret", label: "Client Secret", secret: true },
//     ],
//   },
//   jsm: {
//     label: "Jira Service Management",
//     accent: "#2684FF",
//     note: "Provide your Jira domain, email, and API token.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Base URL",
//         secret: false,
//         placeholder: "https://yourdomain.atlassian.net",
//       },
//       { key: "email", label: "Email Address", secret: false },
//       { key: "apiToken", label: "API Token", secret: true },
//     ],
//   },
//   hexnode: {
//     label: "Hexnode",
//     accent: "#3498DB",
//     note: "Enter your Hexnode portal URL and API key.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Portal URL",
//         secret: false,
//         placeholder: "https://yourcompany.hexnode.com",
//       },
//       { key: "apiKey", label: "API Key", secret: true },
//     ],
//   },
//   splunk: {
//     label: "Splunk",
//     accent: "#000000",
//     note: "Enter your Splunk management URL and authentication token.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Management URL",
//         secret: false,
//         placeholder: "https://splunk.yourdomain.com:8089",
//       },
//       { key: "token", label: "Auth Token", secret: true },
//     ],
//   },
//   auth0: {
//     label: "Auth0",
//     accent: "#EB5424",
//     note: "Provide your Auth0 domain, client ID, and client secret.",
//     fields: [
//       {
//         key: "domain",
//         label: "Domain",
//         secret: false,
//         placeholder: "yourtenant.auth0.com",
//       },
//       { key: "clientId", label: "Client ID", secret: false },
//       { key: "clientSecret", label: "Client Secret", secret: true },
//     ],
//   },
//   onelogin: {
//     label: "OneLogin",
//     accent: "#0275D8",
//     note: "Provide your OneLogin region, client ID, and client secret.",
//     fields: [
//       {
//         key: "region",
//         label: "Region (us/eu)",
//         secret: false,
//         placeholder: "us",
//       },
//       { key: "clientId", label: "Client ID", secret: false },
//       { key: "clientSecret", label: "Client Secret", secret: true },
//     ],
//   },
//   fortigate: {
//     label: "FortiGate",
//     accent: "#D32F2F",
//     note: "Enter your FortiGate API URL and access token.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "API URL",
//         secret: false,
//         placeholder: "https://fortigate.yourdomain.com",
//       },
//       { key: "accessToken", label: "Access Token", secret: true },
//     ],
//   },
//   proofpoint: {
//     label: "Proofpoint",
//     accent: "#0D47A1",
//     note: "Enter your Proofpoint cluster ID and API key.",
//     fields: [
//       { key: "clusterId", label: "Cluster ID", secret: false },
//       { key: "apiKey", label: "API Key", secret: true },
//     ],
//   },
//   sonarqube: {
//     label: "SonarQube",
//     accent: "#4A90E2",
//     note: "Enter your SonarQube URL and user token.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Base URL",
//         secret: false,
//         placeholder: "https://sonarqube.yourdomain.com",
//       },
//       { key: "token", label: "Token", secret: true },
//     ],
//   },
//   slack: {
//     label: "Slack",
//     accent: "#E01E5A",
//     note: "Provide your Slack Team ID and bot token.",
//     fields: [
//       { key: "teamId", label: "Team ID", secret: false },
//       {
//         key: "token",
//         label: "Bot Token",
//         secret: true,
//         placeholder: "xoxb-...",
//       },
//     ],
//   },
//   gitlab: {
//     label: "GitLab",
//     accent: "#FC6D26",
//     note: "Enter your GitLab instance URL and personal access token.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Instance URL",
//         secret: false,
//         placeholder: "https://gitlab.com",
//       },
//       { key: "accessToken", label: "Access Token", secret: true },
//     ],
//   },
//   okta: {
//     label: "Okta",
//     accent: "#007DC1",
//     note: "Provide your Okta organization URL and API token.",
//     fields: [
//       {
//         key: "orgUrl",
//         label: "Org URL",
//         secret: false,
//         placeholder: "https://yourcompany.okta.com",
//       },
//       { key: "apiToken", label: "API Token", secret: true },
//     ],
//   },
//   datadog: {
//     label: "Datadog",
//     accent: "#632CA6",
//     note: "Enter your Datadog site, API key, and Application key.",
//     fields: [
//       {
//         key: "site",
//         label: "Site",
//         secret: false,
//         placeholder: "datadoghq.com",
//       },
//       { key: "apiKey", label: "API Key", secret: true },
//       { key: "appKey", label: "Application Key", secret: true },
//     ],
//   },
//   sentinelone: {
//     label: "SentinelOne",
//     accent: "#4A154B",
//     note: "Generate a Management Console API Token under Settings → Users → your user → Generate API Token (a dedicated service account is recommended for production). For local testing against the bundled mock server, set Base URL to http://localhost:8080/mock-sentinelone and use any non-empty value for the token.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "SentinelOne Base URL",
//         secret: false,
//         placeholder: "https://yourcompany.sentinelone.net",
//       },
//       { key: "apiToken", label: "API Token", secret: true },
//     ],
//   },
//   duo: {
//     label: "Duo Security",
//     accent: "#6BC5F8",
//     note: "Create an Admin API application under Admin Panel → Applications → Protect an Application in Duo, then copy the API Hostname, Integration Key, and Secret Key it generates. The API Hostname looks like api-xxxxxxxx.duosecurity.com — not your own company domain.",
//     fields: [
//       {
//         key: "apiHostname",
//         label: "API Hostname",
//         secret: false,
//         placeholder: "api-xxxxxxxx.duosecurity.com",
//       },
//       { key: "integrationKey", label: "Integration Key", secret: false },
//       { key: "secretKey", label: "Secret Key", secret: true },
//     ],
//   },
//   lastpass: {
//     label: "LastPass",
//     accent: "#D32D27",
//     note: "In the LastPass Admin Console, go to Advanced → Enterprise API to find your Account Number (CID) and generate/reset the Provisioning Hash. Both values together authenticate every Enterprise API call — the hash is your secret credential.",
//     fields: [
//       { key: "cid", label: "Account Number (CID)", secret: false },
//       { key: "provisioningHash", label: "Provisioning Hash", secret: true },
//     ],
//   },
//   rapid7: {
//     label: "Rapid7 InsightVM",
//     accent: "#C8102E",
//     note: "Point to your InsightVM Security Console (default HTTPS port 3780) and provide a dedicated API/service account with read access to Sites and Assets. This uses the same credentials as console sign-in — a scoped, non-admin account is recommended.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Security Console URL",
//         secret: false,
//         placeholder: "https://insightvm.yourcompany.com:3780",
//       },
//       { key: "username", label: "Username", secret: false },
//       { key: "password", label: "Password", secret: true },
//     ],
//   },
//   veracode: {
//     label: "Veracode",
//     accent: "#EF4023",
//     note: "Generate an API ID and API Key from your Veracode account under Settings → API Credentials. Requests are HMAC-signed automatically — no need to paste a raw bearer token.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "API Base URL",
//         secret: false,
//         placeholder: "https://api.veracode.com",
//       },
//       { key: "apiId", label: "API ID", secret: false },
//       { key: "apiKey", label: "API Key", secret: true },
//     ],
//   },
//   zscaler: {
//     label: "Zscaler",
//     accent: "#00A4E4",
//     note: "Use an admin account with API access enabled in the ZIA Admin Portal, and generate an API Key under Administration → API Key Management. Base URL depends on your ZIA cloud (e.g. zsapi.zscaler.net, zsapi.zscalertwo.net).",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "ZIA Admin API Base URL",
//         secret: false,
//         placeholder: "https://zsapi.zscaler.net/api/v1",
//       },
//       { key: "username", label: "Admin Username", secret: false },
//       { key: "password", label: "Admin Password", secret: true },
//       { key: "apiKey", label: "API Key", secret: true },
//     ],
//   },
//   netskope: {
//     label: "Netskope",
//     accent: "#6ABE45",
//     note: "Generate a REST API v2 token from your Netskope tenant under Settings → Tools → REST API v2, with read access to DLP policies.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Tenant URL",
//         secret: false,
//         placeholder: "https://yourcompany.goskope.com",
//       },
//       { key: "apiToken", label: "API Token", secret: true },
//     ],
//   },
//   digitalguardian: {
//     label: "Digital Guardian",
//     accent: "#002554",
//     note: "Register an OAuth2 client in the Digital Guardian ARC console (Administration → API Clients) with read access to DLP policies, then paste the Client ID and Secret below.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "ARC API Base URL",
//         secret: false,
//         placeholder: "https://api.digitalguardian.com",
//       },
//       { key: "clientId", label: "Client ID", secret: false },
//       { key: "clientSecret", label: "Client Secret", secret: true },
//     ],
//   },

//   elastic: {
//     label: "Elastic Security",
//     accent: "#005571",
//     note: "In Kibana, go to Stack Management → API Keys and create a key scoped to read access on the Detection Engine (rules and signals index). Paste the Kibana base URL and the Base64-encoded API key below.",
//     fields: [
//       {
//         key: "kibanaUrl",
//         label: "Kibana Base URL",
//         secret: false,
//         placeholder: "https://yourcompany.kb.us-east-1.aws.elastic-cloud.com",
//       },
//       { key: "apiKey", label: "API Key (Base64 Encoded)", secret: true },
//     ],
//   },

//   qualys: {
//     label: "Qualys VMDR",
//     accent: "#CC0000",
//     note: "Create a dedicated read-only user in the Qualys Cloud Platform (Users → New User, with the Reader role scoped to the asset groups you want scanned) and use its credentials below. The Base URL is your Qualys API server, which depends on your platform region.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Qualys API Base URL",
//         secret: false,
//         placeholder: "https://qualysapi.qualys.com",
//       },
//       { key: "username", label: "Username", secret: false },
//       { key: "password", label: "Password", secret: true },
//     ],
//   },
//   sumologic: {
//     label: "Sumo Logic",
//     accent: "#004DFF",
//     note: "In Sumo Logic, go to Administration → Security → Access Keys to generate an Access ID and Access Key. The API Endpoint is deployment-specific — check Administration → Account Overview for your deployment's API URL.",
//     fields: [
//       {
//         key: "apiEndpoint",
//         label: "API Endpoint",
//         secret: false,
//         placeholder: "https://api.us2.sumologic.com/api",
//       },
//       { key: "accessId", label: "Access ID", secret: false },
//       { key: "accessKey", label: "Access Key", secret: true },
//     ],
//   },
//   checkmarx: {
//     label: "Checkmarx One",
//     accent: "#5A2D82",
//     note: "In Checkmarx One, go to Settings → API Keys to generate an API Key for a service account scoped to read access on Projects and Results. Base URL and Tenant Name depend on your Checkmarx One region and account.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Checkmarx One Base URL",
//         secret: false,
//         placeholder: "https://ast.checkmarx.net",
//       },
//       {
//         key: "tenant",
//         label: "Tenant Name",
//         secret: false,
//         placeholder: "yourcompany",
//       },
//       { key: "apiKey", label: "API Key", secret: true },
//     ],
//   },
//   cyberark: {
//     label: "CyberArk",
//     accent: "#000000",
//     note: "Provide your CyberArk PVWA Base URL, Username, and Password.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "PVWA Base URL",
//         secret: false,
//         placeholder: "https://cyberark.yourcompany.com",
//       },
//       { key: "username", label: "Username", secret: false },
//       { key: "password", label: "Password", secret: true },
//     ],
//   },
//   delinea: {
//     label: "Delinea",
//     accent: "#005D90",
//     note: "Provide your Delinea Secret Server Base URL, Username, and Password for OAuth2 authentication.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Secret Server Base URL",
//         secret: false,
//         placeholder: "https://yourcompany.secretservercloud.com",
//       },
//       { key: "username", label: "Username", secret: false },
//       { key: "password", label: "Password", secret: true },
//     ],
//   },
//   sailpoint: {
//     label: "SailPoint",
//     accent: "#0047BB",
//     note: "Provide your SailPoint IdentityNow Base URL, Client ID, and Client Secret.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "IdentityNow Base URL",
//         secret: false,
//         placeholder: "https://yourcompany.api.identitynow.com",
//       },
//       { key: "clientId", label: "Client ID", secret: false },
//       { key: "clientSecret", label: "Client Secret", secret: true },
//     ],
//   },
//   pingidentity: {
//     label: "Ping Identity",
//     accent: "#E82438",
//     note: "Provide your PingOne Environment Base URL, Client ID, and Client Secret.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Environment Base URL",
//         secret: false,
//         placeholder: "https://api.pingone.com/v1/environments/{env-id}",
//       },
//       { key: "clientId", label: "Client ID", secret: false },
//       { key: "clientSecret", label: "Client Secret", secret: true },
//     ],
//   },
//   meraki: {
//     label: "Cisco Meraki",
//     accent: "#78BE20",
//     note: "In the Meraki Dashboard, go to Organization → Settings and enable API access, then generate a key under your user profile (My Profile → API access). Also copy your Organization ID from Organization → Settings — most Dashboard API endpoints are scoped to it.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Meraki API Base URL",
//         secret: false,
//         placeholder: "https://api.meraki.com/api/v1",
//       },
//       { key: "organizationId", label: "Organization ID", secret: false },
//       { key: "apiKey", label: "API Key", secret: true },
//     ],
//   },
//   sentinel: {
//     label: "Microsoft Sentinel",
//     accent: "#0078D4",
//     note: "Register an app in Azure AD (App registrations → New registration), grant it the Microsoft Sentinel Reader role on the Log Analytics workspace's resource group, and create a client secret. You'll also need the Subscription ID, Resource Group, and Workspace Name from the Sentinel workspace overview page.",
//     fields: [
//       { key: "tenantId", label: "Azure Tenant ID", secret: false },
//       { key: "clientId", label: "Client ID", secret: false },
//       { key: "clientSecret", label: "Client Secret", secret: true },
//       { key: "subscriptionId", label: "Subscription ID", secret: false },
//       { key: "resourceGroup", label: "Resource Group", secret: false },
//       {
//         key: "workspaceName",
//         label: "Log Analytics Workspace Name",
//         secret: false,
//       },
//     ],
//   },
//   qradar: {
//     label: "IBM QRadar",
//     accent: "#054ADA",
//     note: "In the QRadar Console, go to Admin → User Management → Authorized Services to generate a SEC token (API token) for a service account scoped to read access on offenses and log sources.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "QRadar Console URL",
//         secret: false,
//         placeholder: "https://qradar.yourcompany.com",
//       },
//       { key: "secToken", label: "SEC Token (API Token)", secret: true },
//     ],
//   },
//   logrhythm: {
//     label: "LogRhythm",
//     accent: "#F47920",
//     note: "In LogRhythm, go to Deployment Manager → Tools → API Keys (or the Admin API settings on your appliance) to generate a Bearer API token for a service account with read access to Log Sources and Alarms.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "LogRhythm API Base URL",
//         secret: false,
//         placeholder: "https://logrhythm.yourcompany.com:8501",
//       },
//       { key: "apiToken", label: "API Token", secret: true },
//     ],
//   },

//   // ── New: Wiz (Cloud Security Posture Management) ──────────────────────
//   wiz: {
//     label: "Wiz",
//     accent: "#6E36E5",
//     note: "Create a Wiz Service Account under Settings → Service Accounts with read-only scope, then paste its Client ID and Client Secret below. Base URL is your tenant's regional API root (no /graphql suffix) — find it under your Wiz tenant's API endpoint documentation, e.g. https://api.us1.app.wiz.io. For local testing against the bundled mock server, set Base URL to http://localhost:8080/mock-wiz and use any non-empty Client ID / Client Secret.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Wiz API Base URL",
//         secret: false,
//         placeholder: "https://api.us1.app.wiz.io",
//       },
//       { key: "clientId", label: "Client ID", secret: false },
//       { key: "clientSecret", label: "Client Secret", secret: true },
//     ],
//   },

//   // ── New: Sophos Central (Endpoint Protection) ──────────────────────────
//   sophos: {
//     label: "Sophos Central",
//     accent: "#00B050",
//     note: "Create an API credential in Sophos Central Admin under Settings → API Credential Management with read-only scope, then paste the Client ID and Client Secret below. Base URL is your tenant's resolved regional API host (from the one-time /whoami/v1 lookup), e.g. https://api-us01.central.sophos.com. For local testing against the bundled mock server, set Base URL to http://localhost:8080/mock-sophos and use any non-empty Client ID / Client Secret.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Sophos Central API Base URL",
//         secret: false,
//         placeholder: "https://api-us01.central.sophos.com",
//       },
//       { key: "clientId", label: "Client ID", secret: false },
//       { key: "clientSecret", label: "Client Secret", secret: true },
//     ],
//   },

//   // ── New: Recorded Future (Threat Intelligence) ─────────────────────────
//   recordedfuture: {
//     label: "Recorded Future",
//     accent: "#C90C3E",
//     note: "Generate an API token from your Recorded Future portal under My Account → API Access. Sent as the X-RFToken header on every request. For local testing against the bundled mock server, set Base URL to http://localhost:8080/mock-recordedfuture and use any non-empty value for the API token.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Recorded Future API Base URL",
//         secret: false,
//         placeholder: "https://api.recordedfuture.com",
//       },
//       { key: "apiToken", label: "API Token", secret: true },
//     ],
//   },
//   tenable: {
//     label: "Tenable",
//     accent: "#005571",
//     note: "Provide your Tenable Base URL, Access Key, and Secret Key.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Base URL",
//         secret: false,
//         placeholder: "https://cloud.tenable.com",
//       },
//       { key: "accessKey", label: "Access Key", secret: false },
//       { key: "secretKey", label: "Secret Key", secret: true },
//     ],
//   },
//   pagerduty: {
//     label: "PagerDuty",
//     accent: "#06D6A0",
//     note: "Provide your PagerDuty API Key.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Base URL",
//         secret: false,
//         placeholder: "https://api.pagerduty.com",
//       },
//       { key: "apiKey", label: "API Key", secret: true },
//     ],
//   },
//   mimecast: {
//     label: "Mimecast",
//     accent: "#111111",
//     note: "Provide your Mimecast Base URL, Client ID, and Client Secret.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Base URL",
//         secret: false,
//         placeholder: "https://us-api.mimecast.com",
//       },
//       { key: "clientId", label: "Client ID", secret: false },
//       { key: "clientSecret", label: "Client Secret", secret: true },
//     ],
//   },
//   freshservice: {
//     label: "Freshservice",
//     accent: "#12344D",
//     note: "Provide your Freshservice Domain and API Key.",
//     fields: [
//       {
//         key: "domain",
//         label: "Domain",
//         secret: false,
//         placeholder: "yourcompany.freshservice.com",
//       },
//       { key: "apiKey", label: "API Key", secret: true },
//     ],
//   },

//   exabeam: {
//     label: "Exabeam",
//     accent: "#000000",
//     note: "Provide your Exabeam Base URL, API Key, and API Secret.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Base URL",
//         secret: false,
//         placeholder: "https://yourcompany.exabeam.com",
//       },
//       { key: "apiKey", label: "API Key", secret: false },
//       { key: "apiSecret", label: "API Secret", secret: true },
//     ],
//   },
//   jfrogxray: {
//     label: "JFrog Xray",
//     accent: "#41BF4B",
//     note: "Provide your JFrog Xray Base URL, Username, and API Key.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Base URL",
//         secret: false,
//         placeholder: "https://yourcompany.jfrog.io/xray",
//       },
//       { key: "username", label: "Username", secret: false },
//       { key: "apiKey", label: "API Key", secret: true },
//     ],
//   },
//   semgrep: {
//     label: "Semgrep",
//     accent: "#000000",
//     note: "Provide your Semgrep Base URL, API Token, and Organization Slug.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Base URL",
//         secret: false,
//         placeholder: "https://semgrep.dev/api/v1",
//       },
//       { key: "orgSlug", label: "Organization Slug", secret: false },
//       { key: "apiToken", label: "API Token", secret: true },
//     ],
//   },
//   bitbucket: {
//     label: "Bitbucket",
//     accent: "#2684FF",
//     note: "Provide your Bitbucket Base URL, Workspace, Username, and App Password.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Base URL",
//         secret: false,
//         placeholder: "https://api.bitbucket.org/2.0",
//       },
//       { key: "workspace", label: "Workspace", secret: false },
//       { key: "username", label: "Username", secret: false },
//       { key: "appPassword", label: "App Password", secret: true },
//     ],
//   },
//   github: {
//     label: "GitHub",
//     accent: "#181717",
//     note: "Provide your GitHub Base URL, Organization name, and Access Token.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Base URL",
//         secret: false,
//         placeholder: "https://api.github.com",
//       },
//       { key: "org", label: "Organization", secret: false },
//       { key: "accessToken", label: "Access Token", secret: true },
//     ],
//   },
//   orca: {
//     label: "Orca Security",
//     accent: "#1A73E8",
//     note: "Provide the Orca Security API base URL and your API token. You can generate a token under Settings → API in the Orca console.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Base URL",
//         secret: false,
//         placeholder: "https://api.orcasecurity.io",
//       },
//       { key: "apiToken", label: "API Token", secret: true },
//     ],
//   },
//   contrast: {
//     label: "Contrast Security",
//     accent: "#EE3124",
//     note: "Provide your Contrast Security TeamServer URL, Organization ID, username, API key, and Service key. Find these under Organization Settings → API in Contrast.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Base URL",
//         secret: false,
//         placeholder: "https://app.contrastsecurity.com/Contrast",
//       },
//       { key: "organizationId", label: "Organization ID", secret: false },
//       { key: "username", label: "Username", secret: false },
//       { key: "apiKey", label: "API Key", secret: true },
//       { key: "serviceKey", label: "Service Key", secret: true },
//     ],
//   },
//   aqua: {
//     label: "Aqua Security",
//     accent: "#007FFF",
//     note: "Provide the Aqua Security console URL and your admin credentials. Ensure the account has API access enabled.",
//     fields: [
//       {
//         key: "baseUrl",
//         label: "Base URL",
//         secret: false,
//         placeholder: "https://your-aqua-console.cloud.aquasec.com",
//       },
//       { key: "username", label: "Username", secret: false },
//       { key: "password", label: "Password", secret: true },
//     ],
//   },
// };

// export default function BuiltInProviderForm({
//   providerKey,
//   configKey,
//   savedConfig,
//   onSave,
//   onRemove,
//   onTest,
// }) {
//   const provider = PROVIDERS[providerKey];

//   if (!provider) {
//     return (
//       <Alert severity="warning" sx={{ borderRadius: "8px" }}>
//         No configuration form has been defined for "{providerKey}" yet.
//       </Alert>
//     );
//   }

//   const saved = savedConfig?.[configKey ?? providerKey];
//   const isConnected = !!saved;

//   const initForm = () => {
//     const form = {};
//     provider.fields.forEach((f) => {
//       form[f.key] = f.secret ? "" : (saved?.[f.key] ?? "");
//     });
//     return form;
//   };

//   const [form, setForm] = useState(initForm);
//   const [saving, setSaving] = useState(false);
//   const [testing, setTesting] = useState(false);
//   const [alert, setAlert] = useState(null);

//   const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

//   const handleSave = async () => {
//     setSaving(true);
//     setAlert(null);
//     try {
//       const payload = {};
//       provider.fields.forEach((f) => {
//         const val = form[f.key];
//         if (f.secret && (!val || val.trim() === "")) return;
//         if (f.key === "evidenceBuckets") {
//           payload[f.key] = val
//             ? val
//                 .split(",")
//                 .map((b) => b.trim())
//                 .filter(Boolean)
//             : [];
//         } else {
//           payload[f.key] = val;
//         }
//       });
//       const data = await onSave(providerKey, payload);
//       setAlert({
//         type: data.success ? "success" : "error",
//         message: data.message,
//       });
//     } catch {
//       setAlert({ type: "error", message: "Failed to save. Please try again." });
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleTest = async () => {
//     setTesting(true);
//     setAlert(null);
//     try {
//       const data = await onTest(providerKey);
//       setAlert({
//         type: data.success ? "success" : "error",
//         message: data.message,
//       });
//     } catch {
//       setAlert({ type: "error", message: "Connection test failed." });
//     } finally {
//       setTesting(false);
//     }
//   };

//   return (
//     <Box>
//       {/* Status row */}
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           mb: 3,
//           p: 2,
//           borderRadius: "10px",
//           background: isConnected
//             ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
//             : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
//           border: `1px solid ${isConnected ? "#bbf7d0" : "#e2e8f0"}`,
//         }}
//       >
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
//           <Box
//             sx={{
//               width: 10,
//               height: 10,
//               borderRadius: "50%",
//               background: isConnected ? "#22c55e" : "#cbd5e1",
//               boxShadow: isConnected ? "0 0 0 3px #dcfce7" : "none",
//             }}
//           />
//           <Typography
//             variant="body2"
//             fontWeight={600}
//             color={isConnected ? "#15803d" : "text.secondary"}
//           >
//             {isConnected ? "Connected" : "Not configured"}
//           </Typography>
//         </Box>
//         {isConnected && (
//           <Typography variant="caption" color="text.secondary">
//             Credentials encrypted · Last updated on save
//           </Typography>
//         )}
//       </Box>

//       {/* Setup note */}
//       <Box
//         sx={{
//           mb: 3,
//           p: 2,
//           borderRadius: "8px",
//           background: "#f8fafc",
//           borderLeft: `3px solid ${provider.accent}`,
//         }}
//       >
//         <Typography
//           variant="caption"
//           color="text.secondary"
//           sx={{ lineHeight: 1.6 }}
//         >
//           {provider.note}
//         </Typography>
//       </Box>

//       <Divider sx={{ mb: 3 }} />

//       {/* Fields */}
//       <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//         {provider.fields.map((f) => (
//           <TextField
//             key={f.key}
//             label={f.label}
//             value={form[f.key] ?? ""}
//             onChange={set(f.key)}
//             type={f.secret ? "password" : "text"}
//             multiline={!!f.multiline}
//             rows={f.multiline ? 5 : 1}
//             placeholder={
//               f.secret && isConnected
//                 ? "Leave blank to keep existing value"
//                 : (f.placeholder ?? "")
//             }
//             size="small"
//             fullWidth
//             sx={{
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: "8px",
//                 fontSize: "0.875rem",
//                 "&:hover fieldset": { borderColor: provider.accent },
//                 "&.Mui-focused fieldset": { borderColor: provider.accent },
//               },
//               "& label.Mui-focused": { color: provider.accent },
//             }}
//           />
//         ))}
//       </Box>

//       {alert && (
//         <Alert severity={alert.type} sx={{ mt: 2.5, borderRadius: "8px" }}>
//           {alert.message}
//         </Alert>
//       )}

//       {/* Actions */}
//       <Box
//         sx={{
//           display: "flex",
//           gap: 1.5,
//           mt: 3,
//           flexWrap: "wrap",
//           alignItems: "center",
//         }}
//       >
//         <Button
//           variant="contained"
//           onClick={handleSave}
//           disabled={saving}
//           startIcon={
//             saving ? (
//               <CircularProgress size={14} color="inherit" />
//             ) : (
//               <SaveOutlinedIcon />
//             )
//           }
//           sx={{
//             borderRadius: "8px",
//             textTransform: "none",
//             fontWeight: 600,
//             fontSize: "0.85rem",
//             background: provider.accent,
//             "&:hover": {
//               background: provider.accent,
//               filter: "brightness(0.9)",
//             },
//             "&:disabled": { opacity: 0.6 },
//           }}
//         >
//           {saving ? "Saving…" : "Save credentials"}
//         </Button>
//         {isConnected && (
//           <>
//             <Button
//               variant="outlined"
//               onClick={handleTest}
//               disabled={testing}
//               startIcon={
//                 testing ? <CircularProgress size={14} /> : <WifiTetheringIcon />
//               }
//               sx={{
//                 borderRadius: "8px",
//                 textTransform: "none",
//                 fontWeight: 500,
//                 fontSize: "0.85rem",
//                 borderColor: provider.accent,
//                 color: provider.accent,
//                 "&:hover": {
//                   borderColor: provider.accent,
//                   background: `${provider.accent}10`,
//                 },
//               }}
//             >
//               {testing ? "Testing…" : "Test connection"}
//             </Button>
//             <Button
//               variant="text"
//               color="error"
//               onClick={() => onRemove(providerKey)}
//               startIcon={<LinkOffIcon />}
//               sx={{
//                 borderRadius: "8px",
//                 textTransform: "none",
//                 fontWeight: 500,
//                 fontSize: "0.85rem",
//                 ml: "auto",
//               }}
//             >
//               Disconnect
//             </Button>
//           </>
//         )}
//       </Box>
//     </Box>
//   );
// }


// C:\Users\user\Downloads\11-8-(A)cf_next-preprod\cf_next-preprod\cf-tool-frontend-main\src\modules\admin\components\Toolintegrations\BuiltInProviderForm.jsx
import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import WifiTetheringIcon from "@mui/icons-material/WifiTethering";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

const PROVIDERS = {
  aws: {
    label: "Amazon Web Services",
    accent: "#FF9900",
    note: "Create a cross-account IAM role that trusts CalVant, then paste the Role ARN. Your credentials are encrypted with AES-256-GCM before storage — never stored in plaintext.",
    fields: [
      { key: "accountId", label: "Account ID", secret: false },
      {
        key: "region",
        label: "Region",
        secret: false,
        placeholder: "ap-south-1",
      },
      {
        key: "roleArn",
        label: "Role ARN",
        secret: true,
        placeholder: "arn:aws:iam::123456789012:role/CalVantReadOnly",
      },
      {
        key: "evidenceBuckets",
        label: "Evidence Buckets (comma-separated)",
        secret: false,
        placeholder: "bucket-1, bucket-2",
      },
    ],
  },
  gws: {
    label: "Google Workspace",
    accent: "#4285F4",
    note: "Create a GCP service account with domain-wide delegation enabled, then paste the full JSON key below.",
    fields: [
      {
        key: "domain",
        label: "Domain",
        secret: false,
        placeholder: "yourcompany.com",
      },
      {
        key: "customerId",
        label: "Customer ID",
        secret: false,
        placeholder: "C0xxxxxxx",
      },
      {
        key: "adminUser",
        label: "Admin User Email",
        secret: false,
        placeholder: "admin@yourcompany.com",
      },
      {
        key: "serviceAccountJson",
        label: "Service Account JSON",
        secret: true,
        multiline: true,
      },
    ],
  },
  m365: {
    label: "Microsoft 365",
    accent: "#0078D4",
    note: "Register an app in Azure AD, grant it Microsoft Graph read permissions, then paste the credentials below.",
    fields: [
      { key: "tenantId", label: "Azure Tenant ID", secret: false },
      { key: "clientId", label: "Client ID", secret: false },
      { key: "clientSecret", label: "Client Secret", secret: true },
    ],
  },
  keka: {
    label: "Keka HR",
    accent: "#E84C3D",
    note: "Find your credentials in Keka under Settings → Developer → API Access.",
    fields: [
      { key: "companyAlias", label: "Company Alias", secret: false },
      { key: "clientId", label: "Client ID", secret: false },
      { key: "clientSecret", label: "Client Secret", secret: true },
      { key: "coreHrApiKey", label: "Core HR API Key", secret: true },
      { key: "leaveApiKey", label: "Leave API Key", secret: true },
      { key: "attendanceApiKey", label: "Attendance Key", secret: true },
    ],
  },
  vault: {
    label: "HashiCorp Vault",
    accent: "#000000",
    note: "Point to your self-hosted Vault instance and provide a token with read access to sys/mounts, sys/audit, and auth/token/lookup-self.",
    fields: [
      {
        key: "baseUrl",
        label: "Vault Base URL",
        secret: false,
        placeholder: "https://vault.yourcompany.com:8200",
      },
      { key: "vaultToken", label: "Vault Token", secret: true },
    ],
  },
  jumpcloud: {
    label: "JumpCloud",
    accent: "#14283D",
    note: "Find your API key under Settings → Administrators → your profile → Enable API access.",
    fields: [{ key: "apiKey", label: "API Key", secret: true }],
  },
  otx: {
    label: "OTX AlienVault",
    accent: "#00A8E0",
    note: "Generate an API key from your OTX account settings page (free tier, no usage limits).",
    fields: [{ key: "apiKey", label: "API Key", secret: true }],
  },
  gophish: {
    label: "GoPhish",
    accent: "#5D4E8C",
    note: "Point to your self-hosted GoPhish instance and provide the Authorization API key from Settings.",
    fields: [
      {
        key: "baseUrl",
        label: "GoPhish Base URL",
        secret: false,
        placeholder: "https://gophish.yourcompany.com",
      },
      { key: "apiKey", label: "API Key", secret: true },
    ],
  },
  snyk: {
    label: "Snyk",
    accent: "#4C4A73",
    note: "Find your Org ID and API token under Account Settings in the Snyk dashboard.",
    fields: [
      { key: "orgId", label: "Organization ID", secret: false },
      { key: "apiKey", label: "API Token", secret: true },
    ],
  },
  cloudflare: {
    label: "Cloudflare",
    accent: "#F38020",
    note: "Create a scoped API Token (Zone → Firewall Services, SSL and Certificates, Analytics — all Read) for your specific zone, then paste the Zone ID from your domain overview page.",
    fields: [
      { key: "zoneId", label: "Zone ID", secret: false },
      { key: "apiToken", label: "API Token", secret: true },
    ],
  },
  notion: {
    label: "Notion",
    accent: "#000000",
    note: "Create an internal integration at notion.so/my-integrations, share the target database with it, then paste the token and database ID below.",
    fields: [
      { key: "databaseId", label: "Database ID", secret: false },
      { key: "integrationToken", label: "Integration Token", secret: true },
    ],
  },
  wazuh: {
    label: "Wazuh",
    accent: "#3253DC",
    note: "Use your Wazuh manager URL and API credentials (default API port is 55000).",
    fields: [
      {
        key: "baseUrl",
        label: "Wazuh Base URL",
        secret: false,
        placeholder: "https://wazuh.yourcompany.com:55000",
      },
      { key: "username", label: "Username", secret: false },
      { key: "password", label: "Password", secret: true },
    ],
  },
  confluence: {
    label: "Confluence",
    accent: "#172B4D",
    note: "Generate an API token from id.atlassian.com/manage-profile/security/api-tokens, then pair it with your Atlassian account email and Confluence site URL.",
    fields: [
      {
        key: "siteUrl",
        label: "Site URL",
        secret: false,
        placeholder: "https://yourcompany.atlassian.net",
      },
      {
        key: "email",
        label: "Atlassian Account Email",
        secret: false,
        placeholder: "you@yourcompany.com",
      },
      { key: "apiToken", label: "API Token", secret: true },
    ],
  },
  pfsense: {
    label: "pfSense",
    accent: "#212121",
    note: "Requires the pfSense-API community package installed on your firewall. Point to your pfSense base URL and provide the API key from your pfSense-API configuration.",
    fields: [
      {
        key: "baseUrl",
        label: "pfSense Base URL",
        secret: false,
        placeholder: "https://firewall.yourcompany.com",
      },
      { key: "apiKey", label: "API Key", secret: true },
    ],
  },
  crowdstrike: {
    label: "CrowdStrike Falcon",
    accent: "#E01F27",
    note: "Create an OAuth2 API client under Support and resources → API clients and keys in the Falcon console, with Hosts: Read, Vulnerabilities (Spotlight): Read, and Alerts: Read scopes. Base URL depends on your Falcon cloud region.",
    fields: [
      {
        key: "baseUrl",
        label: "Falcon Base URL",
        secret: false,
        placeholder: "https://api.crowdstrike.com",
      },
      { key: "clientId", label: "Client ID", secret: false },
      { key: "clientSecret", label: "Client Secret", secret: true },
    ],
  },
  owaspzap: {
    label: "OWASP ZAP",
    accent: "#4B0082",
    note: "Point to your self-hosted ZAP daemon and the API key from Tools → Options → API in the ZAP GUI. Target URL should match the site ZAP has scanned so alerts are scoped correctly.",
    fields: [
      {
        key: "baseUrl",
        label: "ZAP Base URL",
        secret: false,
        placeholder: "http://zap.yourcompany.com:8080",
      },
      { key: "apiKey", label: "API Key", secret: true },
      {
        key: "targetUrl",
        label: "Target URL (scanned site)",
        secret: false,
        placeholder: "https://app.yourcompany.com",
      },
    ],
  },
  keycloak: {
    label: "Keycloak",
    accent: "#4D4D4D",
    note: 'Create a confidential client in your realm with Service Accounts enabled, and assign it the realm-management "view-users" and "view-events" roles. Also confirm Realm Settings → Events → "Save Events" is turned on, otherwise the access-review control will always show non-compliant.',
    fields: [
      {
        key: "baseUrl",
        label: "Keycloak Base URL",
        secret: false,
        placeholder: "https://auth.yourcompany.com",
      },
      {
        key: "realm",
        label: "Realm",
        secret: false,
        placeholder: "yourcompany",
      },
      { key: "clientId", label: "Client ID", secret: false },
      { key: "clientSecret", label: "Client Secret", secret: true },
    ],
  },
  paloalto: {
    label: "Palo Alto Networks",
    accent: "#FA582D",
    note: "Placeholder credentials — swap the fields below once you confirm which Palo Alto API you're integrating with (PAN-OS XML/REST API key, or Cortex/Prisma OAuth2 client).",
    fields: [
      {
        key: "baseUrl",
        label: "Base URL",
        secret: false,
        placeholder: "https://firewall.yourcompany.com",
      },
      { key: "apiKey", label: "API Key", secret: true },
    ],
  },
  jamfpro: {
    label: "Jamf Pro",
    accent: "#26A055",
    note: "Provide your Jamf Pro Base URL, Client ID, and Client Secret with read access to the devices and configuration profiles API.",
    fields: [
      {
        key: "baseUrl",
        label: "Jamf Pro Base URL",
        secret: false,
        placeholder: "https://yourcompany.jamfcloud.com",
      },
      { key: "clientId", label: "Client ID", secret: false },
      { key: "clientSecret", label: "Client Secret", secret: true },
    ],
  },
  misp: {
    label: "MISP Threat Intelligence",
    accent: "#A020F0",
    note: "Provide your MISP Base URL and API Auth Key. The key must have read permissions to access events.",
    fields: [
      {
        key: "baseUrl",
        label: "MISP Base URL",
        secret: false,
        placeholder: "https://misp.yourcompany.com",
      },
      { key: "apiKey", label: "API Auth Key", secret: true },
    ],
  },
  graylog: {
    label: "Graylog",
    accent: "#FF3633",
    note: 'Generate a personal access token from your Graylog user profile ("Edit Tokens"), then point to the base URL of your Graylog instance (the REST API listens on the same host, typically port 9000).',
    fields: [
      {
        key: "baseUrl",
        label: "Graylog Base URL",
        secret: false,
        placeholder: "https://graylog.yourcompany.com:9000",
      },
      { key: "apiToken", label: "API Token", secret: true },
    ],
  },
  bitwarden: {
    label: "Bitwarden Teams",
    accent: "#175DDC",
    note: "In your Bitwarden organization vault, go to Business Settings → API Key to generate a Client ID and Client Secret. The Organization ID is on the same page (or in the org vault URL).",
    fields: [
      { key: "organizationId", label: "Organization ID", secret: false },
      { key: "clientId", label: "Client ID", secret: false },
      { key: "clientSecret", label: "Client Secret", secret: true },
    ],
  },
  teams: {
    label: "Microsoft Teams",
    accent: "#6264A7",
    note: "In the target Teams channel, go to Connectors → Incoming Webhook, create one, and paste the generated webhook URL below. Compliance sync results and alerts will be posted to that channel.",
    fields: [
      {
        key: "webhookUrl",
        label: "Incoming Webhook URL",
        secret: true,
        placeholder: "https://yourcompany.webhook.office.com/webhookb2/...",
      },
    ],
  },
  frigate: {
    label: "Frigate NVR",
    accent: "#06B6D4",
    note: 'In your Frigate config.yml, enable the built-in auth module and create a user under the "auth" section (Frigate supports running with no auth too — leave Username/Password blank if your instance is unauthenticated). Point Base URL at the host serving the Frigate web UI/API.',
    fields: [
      {
        key: "baseUrl",
        label: "Frigate Base URL",
        secret: false,
        placeholder: "https://frigate.yourcompany.com",
      },
      { key: "username", label: "Username", secret: false },
      { key: "password", label: "Password", secret: true },
    ],
  },
  verkada: {
    label: "Verkada",
    accent: "#000000",
    note: 'Generate an API key in Verkada Command under Admin → API → API Keys (read-only "Cameras" scope is sufficient). For local testing against the bundled mock server, set Base URL to http://localhost:8080/mock-verkada and use any non-empty value for the API key.',
    fields: [
      {
        key: "baseUrl",
        label: "Base URL",
        secret: false,
        placeholder: "https://api.verkada.com",
      },
      { key: "apiKey", label: "API Key", secret: true },
    ],
  },
  onepassword: {
    label: "1Password",
    accent: "#0C66E4",
    note: "Provide your 1Password Connect Server URL and access token.",
    fields: [
      { key: "baseUrl", label: "Connect Server URL", secret: false },
      { key: "accessToken", label: "Access Token", secret: true },
    ],
  },
  servicenow: {
    label: "ServiceNow",
    accent: "#81B5A1",
    note: "Provide your ServiceNow instance URL, client ID, and secret.",
    fields: [
      {
        key: "baseUrl",
        label: "Instance URL",
        secret: false,
        placeholder: "https://dev12345.service-now.com",
      },
      { key: "clientId", label: "Client ID", secret: false },
      { key: "clientSecret", label: "Client Secret", secret: true },
    ],
  },
  jsm: {
    label: "Jira Service Management",
    accent: "#2684FF",
    note: "Provide your Jira domain, email, and API token.",
    fields: [
      {
        key: "baseUrl",
        label: "Base URL",
        secret: false,
        placeholder: "https://yourdomain.atlassian.net",
      },
      { key: "email", label: "Email Address", secret: false },
      { key: "apiToken", label: "API Token", secret: true },
    ],
  },
  hexnode: {
    label: "Hexnode",
    accent: "#3498DB",
    note: "Enter your Hexnode portal URL and API key.",
    fields: [
      {
        key: "baseUrl",
        label: "Portal URL",
        secret: false,
        placeholder: "https://yourcompany.hexnode.com",
      },
      { key: "apiKey", label: "API Key", secret: true },
    ],
  },
  splunk: {
    label: "Splunk",
    accent: "#000000",
    note: "Enter your Splunk management URL and authentication token.",
    fields: [
      {
        key: "baseUrl",
        label: "Management URL",
        secret: false,
        placeholder: "https://splunk.yourdomain.com:8089",
      },
      { key: "token", label: "Auth Token", secret: true },
    ],
  },
  auth0: {
    label: "Auth0",
    accent: "#EB5424",
    note: "Provide your Auth0 domain, client ID, and client secret.",
    fields: [
      {
        key: "domain",
        label: "Domain",
        secret: false,
        placeholder: "yourtenant.auth0.com",
      },
      { key: "clientId", label: "Client ID", secret: false },
      { key: "clientSecret", label: "Client Secret", secret: true },
    ],
  },
  onelogin: {
    label: "OneLogin",
    accent: "#0275D8",
    note: "Provide your OneLogin region, client ID, and client secret.",
    fields: [
      {
        key: "region",
        label: "Region (us/eu)",
        secret: false,
        placeholder: "us",
      },
      { key: "clientId", label: "Client ID", secret: false },
      { key: "clientSecret", label: "Client Secret", secret: true },
    ],
  },
  fortigate: {
    label: "FortiGate",
    accent: "#D32F2F",
    note: "Enter your FortiGate API URL and access token.",
    fields: [
      {
        key: "baseUrl",
        label: "API URL",
        secret: false,
        placeholder: "https://fortigate.yourdomain.com",
      },
      { key: "accessToken", label: "Access Token", secret: true },
    ],
  },
  proofpoint: {
    label: "Proofpoint",
    accent: "#0D47A1",
    note: "Enter your Proofpoint cluster ID and API key.",
    fields: [
      { key: "clusterId", label: "Cluster ID", secret: false },
      { key: "apiKey", label: "API Key", secret: true },
    ],
  },
  sonarqube: {
    label: "SonarQube",
    accent: "#4A90E2",
    note: "Enter your SonarQube URL and user token.",
    fields: [
      {
        key: "baseUrl",
        label: "Base URL",
        secret: false,
        placeholder: "https://sonarqube.yourdomain.com",
      },
      { key: "token", label: "Token", secret: true },
    ],
  },
  slack: {
    label: "Slack",
    accent: "#E01E5A",
    note: "Provide your Slack Team ID and bot token.",
    fields: [
      { key: "teamId", label: "Team ID", secret: false },
      {
        key: "token",
        label: "Bot Token",
        secret: true,
        placeholder: "xoxb-...",
      },
    ],
  },
  gitlab: {
    label: "GitLab",
    accent: "#FC6D26",
    note: "Enter your GitLab instance URL and personal access token.",
    fields: [
      {
        key: "baseUrl",
        label: "Instance URL",
        secret: false,
        placeholder: "https://gitlab.com",
      },
      { key: "accessToken", label: "Access Token", secret: true },
    ],
  },
  okta: {
    label: "Okta",
    accent: "#007DC1",
    note: "Provide your Okta organization URL and API token.",
    fields: [
      {
        key: "orgUrl",
        label: "Org URL",
        secret: false,
        placeholder: "https://yourcompany.okta.com",
      },
      { key: "apiToken", label: "API Token", secret: true },
    ],
  },
  datadog: {
    label: "Datadog",
    accent: "#632CA6",
    note: "Enter your Datadog site, API key, and Application key.",
    fields: [
      {
        key: "site",
        label: "Site",
        secret: false,
        placeholder: "datadoghq.com",
      },
      { key: "apiKey", label: "API Key", secret: true },
      { key: "appKey", label: "Application Key", secret: true },
    ],
  },
  sentinelone: {
    label: "SentinelOne",
    accent: "#4A154B",
    note: "Generate a Management Console API Token under Settings → Users → your user → Generate API Token (a dedicated service account is recommended for production). For local testing against the bundled mock server, set Base URL to http://localhost:8080/mock-sentinelone and use any non-empty value for the token.",
    fields: [
      {
        key: "baseUrl",
        label: "SentinelOne Base URL",
        secret: false,
        placeholder: "https://yourcompany.sentinelone.net",
      },
      { key: "apiToken", label: "API Token", secret: true },
    ],
  },
  duo: {
    label: "Duo Security",
    accent: "#6BC5F8",
    note: "Create an Admin API application under Admin Panel → Applications → Protect an Application in Duo, then copy the API Hostname, Integration Key, and Secret Key it generates. The API Hostname looks like api-xxxxxxxx.duosecurity.com — not your own company domain.",
    fields: [
      {
        key: "apiHostname",
        label: "API Hostname",
        secret: false,
        placeholder: "api-xxxxxxxx.duosecurity.com",
      },
      { key: "integrationKey", label: "Integration Key", secret: false },
      { key: "secretKey", label: "Secret Key", secret: true },
    ],
  },
  lastpass: {
    label: "LastPass",
    accent: "#D32D27",
    note: "In the LastPass Admin Console, go to Advanced → Enterprise API to find your Account Number (CID) and generate/reset the Provisioning Hash. Both values together authenticate every Enterprise API call — the hash is your secret credential.",
    fields: [
      { key: "cid", label: "Account Number (CID)", secret: false },
      { key: "provisioningHash", label: "Provisioning Hash", secret: true },
    ],
  },
  rapid7: {
    label: "Rapid7 InsightVM",
    accent: "#C8102E",
    note: "Point to your InsightVM Security Console (default HTTPS port 3780) and provide a dedicated API/service account with read access to Sites and Assets. This uses the same credentials as console sign-in — a scoped, non-admin account is recommended.",
    fields: [
      {
        key: "baseUrl",
        label: "Security Console URL",
        secret: false,
        placeholder: "https://insightvm.yourcompany.com:3780",
      },
      { key: "username", label: "Username", secret: false },
      { key: "password", label: "Password", secret: true },
    ],
  },
  veracode: {
    label: "Veracode",
    accent: "#EF4023",
    note: "Generate an API ID and API Key from your Veracode account under Settings → API Credentials. Requests are HMAC-signed automatically — no need to paste a raw bearer token.",
    fields: [
      {
        key: "baseUrl",
        label: "API Base URL",
        secret: false,
        placeholder: "https://api.veracode.com",
      },
      { key: "apiId", label: "API ID", secret: false },
      { key: "apiKey", label: "API Key", secret: true },
    ],
  },
  zscaler: {
    label: "Zscaler",
    accent: "#00A4E4",
    note: "Use an admin account with API access enabled in the ZIA Admin Portal, and generate an API Key under Administration → API Key Management. Base URL depends on your ZIA cloud (e.g. zsapi.zscaler.net, zsapi.zscalertwo.net).",
    fields: [
      {
        key: "baseUrl",
        label: "ZIA Admin API Base URL",
        secret: false,
        placeholder: "https://zsapi.zscaler.net/api/v1",
      },
      { key: "username", label: "Admin Username", secret: false },
      { key: "password", label: "Admin Password", secret: true },
      { key: "apiKey", label: "API Key", secret: true },
    ],
  },
  netskope: {
    label: "Netskope",
    accent: "#6ABE45",
    note: "Generate a REST API v2 token from your Netskope tenant under Settings → Tools → REST API v2, with read access to DLP policies.",
    fields: [
      {
        key: "baseUrl",
        label: "Tenant URL",
        secret: false,
        placeholder: "https://yourcompany.goskope.com",
      },
      { key: "apiToken", label: "API Token", secret: true },
    ],
  },
  digitalguardian: {
    label: "Digital Guardian",
    accent: "#002554",
    note: "Register an OAuth2 client in the Digital Guardian ARC console (Administration → API Clients) with read access to DLP policies, then paste the Client ID and Secret below.",
    fields: [
      {
        key: "baseUrl",
        label: "ARC API Base URL",
        secret: false,
        placeholder: "https://api.digitalguardian.com",
      },
      { key: "clientId", label: "Client ID", secret: false },
      { key: "clientSecret", label: "Client Secret", secret: true },
    ],
  },

  elastic: {
    label: "Elastic Security",
    accent: "#005571",
    note: "In Kibana, go to Stack Management → API Keys and create a key scoped to read access on the Detection Engine (rules and signals index). Paste the Kibana base URL and the Base64-encoded API key below.",
    fields: [
      {
        key: "kibanaUrl",
        label: "Kibana Base URL",
        secret: false,
        placeholder: "https://yourcompany.kb.us-east-1.aws.elastic-cloud.com",
      },
      { key: "apiKey", label: "API Key (Base64 Encoded)", secret: true },
    ],
  },

  qualys: {
    label: "Qualys VMDR",
    accent: "#CC0000",
    note: "Create a dedicated read-only user in the Qualys Cloud Platform (Users → New User, with the Reader role scoped to the asset groups you want scanned) and use its credentials below. The Base URL is your Qualys API server, which depends on your platform region.",
    fields: [
      {
        key: "baseUrl",
        label: "Qualys API Base URL",
        secret: false,
        placeholder: "https://qualysapi.qualys.com",
      },
      { key: "username", label: "Username", secret: false },
      { key: "password", label: "Password", secret: true },
    ],
  },
  sumologic: {
    label: "Sumo Logic",
    accent: "#004DFF",
    note: "In Sumo Logic, go to Administration → Security → Access Keys to generate an Access ID and Access Key. The API Endpoint is deployment-specific — check Administration → Account Overview for your deployment's API URL.",
    fields: [
      {
        key: "apiEndpoint",
        label: "API Endpoint",
        secret: false,
        placeholder: "https://api.us2.sumologic.com/api",
      },
      { key: "accessId", label: "Access ID", secret: false },
      { key: "accessKey", label: "Access Key", secret: true },
    ],
  },
  checkmarx: {
    label: "Checkmarx One",
    accent: "#5A2D82",
    note: "In Checkmarx One, go to Settings → API Keys to generate an API Key for a service account scoped to read access on Projects and Results. Base URL and Tenant Name depend on your Checkmarx One region and account.",
    fields: [
      {
        key: "baseUrl",
        label: "Checkmarx One Base URL",
        secret: false,
        placeholder: "https://ast.checkmarx.net",
      },
      {
        key: "tenant",
        label: "Tenant Name",
        secret: false,
        placeholder: "yourcompany",
      },
      { key: "apiKey", label: "API Key", secret: true },
    ],
  },
  cyberark: {
    label: "CyberArk",
    accent: "#000000",
    note: "Provide your CyberArk PVWA Base URL, Username, and Password.",
    fields: [
      {
        key: "baseUrl",
        label: "PVWA Base URL",
        secret: false,
        placeholder: "https://cyberark.yourcompany.com",
      },
      { key: "username", label: "Username", secret: false },
      { key: "password", label: "Password", secret: true },
    ],
  },
  delinea: {
    label: "Delinea",
    accent: "#005D90",
    note: "Provide your Delinea Secret Server Base URL, Username, and Password for OAuth2 authentication.",
    fields: [
      {
        key: "baseUrl",
        label: "Secret Server Base URL",
        secret: false,
        placeholder: "https://yourcompany.secretservercloud.com",
      },
      { key: "username", label: "Username", secret: false },
      { key: "password", label: "Password", secret: true },
    ],
  },
  sailpoint: {
    label: "SailPoint",
    accent: "#0047BB",
    note: "Provide your SailPoint IdentityNow Base URL, Client ID, and Client Secret.",
    fields: [
      {
        key: "baseUrl",
        label: "IdentityNow Base URL",
        secret: false,
        placeholder: "https://yourcompany.api.identitynow.com",
      },
      { key: "clientId", label: "Client ID", secret: false },
      { key: "clientSecret", label: "Client Secret", secret: true },
    ],
  },
  pingidentity: {
    label: "Ping Identity",
    accent: "#E82438",
    note: "Provide your PingOne Environment Base URL, Client ID, and Client Secret.",
    fields: [
      {
        key: "baseUrl",
        label: "Environment Base URL",
        secret: false,
        placeholder: "https://api.pingone.com/v1/environments/{env-id}",
      },
      { key: "clientId", label: "Client ID", secret: false },
      { key: "clientSecret", label: "Client Secret", secret: true },
    ],
  },
  meraki: {
    label: "Cisco Meraki",
    accent: "#78BE20",
    note: "In the Meraki Dashboard, go to Organization → Settings and enable API access, then generate a key under your user profile (My Profile → API access). Also copy your Organization ID from Organization → Settings — most Dashboard API endpoints are scoped to it.",
    fields: [
      {
        key: "baseUrl",
        label: "Meraki API Base URL",
        secret: false,
        placeholder: "https://api.meraki.com/api/v1",
      },
      { key: "organizationId", label: "Organization ID", secret: false },
      { key: "apiKey", label: "API Key", secret: true },
    ],
  },
  sentinel: {
    label: "Microsoft Sentinel",
    accent: "#0078D4",
    note: "Register an app in Azure AD (App registrations → New registration), grant it the Microsoft Sentinel Reader role on the Log Analytics workspace's resource group, and create a client secret. You'll also need the Subscription ID, Resource Group, and Workspace Name from the Sentinel workspace overview page.",
    fields: [
      { key: "tenantId", label: "Azure Tenant ID", secret: false },
      { key: "clientId", label: "Client ID", secret: false },
      { key: "clientSecret", label: "Client Secret", secret: true },
      { key: "subscriptionId", label: "Subscription ID", secret: false },
      { key: "resourceGroup", label: "Resource Group", secret: false },
      {
        key: "workspaceName",
        label: "Log Analytics Workspace Name",
        secret: false,
      },
    ],
  },
  qradar: {
    label: "IBM QRadar",
    accent: "#054ADA",
    note: "In the QRadar Console, go to Admin → User Management → Authorized Services to generate a SEC token (API token) for a service account scoped to read access on offenses and log sources.",
    fields: [
      {
        key: "baseUrl",
        label: "QRadar Console URL",
        secret: false,
        placeholder: "https://qradar.yourcompany.com",
      },
      { key: "secToken", label: "SEC Token (API Token)", secret: true },
    ],
  },
  logrhythm: {
    label: "LogRhythm",
    accent: "#F47920",
    note: "In LogRhythm, go to Deployment Manager → Tools → API Keys (or the Admin API settings on your appliance) to generate a Bearer API token for a service account with read access to Log Sources and Alarms.",
    fields: [
      {
        key: "baseUrl",
        label: "LogRhythm API Base URL",
        secret: false,
        placeholder: "https://logrhythm.yourcompany.com:8501",
      },
      { key: "apiToken", label: "API Token", secret: true },
    ],
  },

  // ── New: Wiz (Cloud Security Posture Management) ──────────────────────
  wiz: {
    label: "Wiz",
    accent: "#6E36E5",
    note: "Create a Wiz Service Account under Settings → Service Accounts with read-only scope, then paste its Client ID and Client Secret below. Base URL is your tenant's regional API root (no /graphql suffix) — find it under your Wiz tenant's API endpoint documentation, e.g. https://api.us1.app.wiz.io. For local testing against the bundled mock server, set Base URL to http://localhost:8080/mock-wiz and use any non-empty Client ID / Client Secret.",
    fields: [
      {
        key: "baseUrl",
        label: "Wiz API Base URL",
        secret: false,
        placeholder: "https://api.us1.app.wiz.io",
      },
      { key: "clientId", label: "Client ID", secret: false },
      { key: "clientSecret", label: "Client Secret", secret: true },
    ],
  },

  // ── New: Sophos Central (Endpoint Protection) ──────────────────────────
  sophos: {
    label: "Sophos Central",
    accent: "#00B050",
    note: "Create an API credential in Sophos Central Admin under Settings → API Credential Management with read-only scope, then paste the Client ID and Client Secret below. Base URL is your tenant's resolved regional API host (from the one-time /whoami/v1 lookup), e.g. https://api-us01.central.sophos.com. For local testing against the bundled mock server, set Base URL to http://localhost:8080/mock-sophos and use any non-empty Client ID / Client Secret.",
    fields: [
      {
        key: "baseUrl",
        label: "Sophos Central API Base URL",
        secret: false,
        placeholder: "https://api-us01.central.sophos.com",
      },
      { key: "clientId", label: "Client ID", secret: false },
      { key: "clientSecret", label: "Client Secret", secret: true },
    ],
  },

  // ── New: Recorded Future (Threat Intelligence) ─────────────────────────
  recordedfuture: {
    label: "Recorded Future",
    accent: "#C90C3E",
    note: "Generate an API token from your Recorded Future portal under My Account → API Access. Sent as the X-RFToken header on every request. For local testing against the bundled mock server, set Base URL to http://localhost:8080/mock-recordedfuture and use any non-empty value for the API token.",
    fields: [
      {
        key: "baseUrl",
        label: "Recorded Future API Base URL",
        secret: false,
        placeholder: "https://api.recordedfuture.com",
      },
      { key: "apiToken", label: "API Token", secret: true },
    ],
  },
  tenable: {
    label: "Tenable",
    accent: "#005571",
    note: "Provide your Tenable Base URL, Access Key, and Secret Key.",
    fields: [
      {
        key: "baseUrl",
        label: "Base URL",
        secret: false,
        placeholder: "https://cloud.tenable.com",
      },
      { key: "accessKey", label: "Access Key", secret: false },
      { key: "secretKey", label: "Secret Key", secret: true },
    ],
  },
  pagerduty: {
    label: "PagerDuty",
    accent: "#06D6A0",
    note: "Provide your PagerDuty API Key.",
    fields: [
      {
        key: "baseUrl",
        label: "Base URL",
        secret: false,
        placeholder: "https://api.pagerduty.com",
      },
      { key: "apiKey", label: "API Key", secret: true },
    ],
  },
  mimecast: {
    label: "Mimecast",
    accent: "#111111",
    note: "Provide your Mimecast Base URL, Client ID, and Client Secret.",
    fields: [
      {
        key: "baseUrl",
        label: "Base URL",
        secret: false,
        placeholder: "https://us-api.mimecast.com",
      },
      { key: "clientId", label: "Client ID", secret: false },
      { key: "clientSecret", label: "Client Secret", secret: true },
    ],
  },
  freshservice: {
    label: "Freshservice",
    accent: "#12344D",
    note: "Provide your Freshservice Domain and API Key.",
    fields: [
      {
        key: "domain",
        label: "Domain",
        secret: false,
        placeholder: "yourcompany.freshservice.com",
      },
      { key: "apiKey", label: "API Key", secret: true },
    ],
  },

  exabeam: {
    label: "Exabeam",
    accent: "#000000",
    note: "Provide your Exabeam Base URL, API Key, and API Secret.",
    fields: [
      {
        key: "baseUrl",
        label: "Base URL",
        secret: false,
        placeholder: "https://yourcompany.exabeam.com",
      },
      { key: "apiKey", label: "API Key", secret: false },
      { key: "apiSecret", label: "API Secret", secret: true },
    ],
  },

  // ── New: Trend Micro Vision One (Endpoint Protection) ───────────────────
  trendmicro: {
    label: "Trend Micro Vision One",
    accent: "#D71920",
    note: "Generate an API token from Vision One under Administration → API Keys, scoped to a read-only role. Base URL is your tenant's regional Vision One API root, e.g. https://api.xdr.trendmicro.com (US) or https://api.eu.xdr.trendmicro.com (EU). Sent as the Authorization: Bearer header on every request.",
    fields: [
      {
        key: "baseUrl",
        label: "Vision One API Base URL",
        secret: false,
        placeholder: "https://api.xdr.trendmicro.com",
      },
      { key: "apiToken", label: "API Token", secret: true },
    ],
  },

  // ── New: Malwarebytes Nebula (Endpoint Protection) ──────────────────────
  malwarebytes: {
    label: "Malwarebytes",
    accent: "#1E88E5",
    note: "Create an API key in Nebula Console under Settings → API Access → \"Create API Key\", scoped to a read-only role. Account ID identifies your Nebula tenant. Auth uses OAuth2 client_credentials against the Nebula API.",
    fields: [
      {
        key: "baseUrl",
        label: "Nebula API Base URL",
        secret: false,
        placeholder: "https://api.nebula.malwarebytes.com",
      },
      { key: "accountId", label: "Account ID", secret: false },
      { key: "clientId", label: "Client ID", secret: false },
      { key: "clientSecret", label: "Client Secret", secret: true },
    ],
  },

  // ── New: Lacework (Cloud Security Posture Management) ───────────────────
  lacework: {
    label: "Lacework",
    accent: "#7B2FF7",
    note: "Generate an API key in Lacework Console under Settings → API Keys → \"Create New\" to obtain a Key ID / Secret pair. Account is your Lacework account subdomain (the part before .lacework.net), e.g. \"mycompany\" for https://mycompany.lacework.net.",
    fields: [
      {
        key: "account",
        label: "Lacework Account",
        secret: false,
        placeholder: "mycompany",
      },
      { key: "keyId", label: "Key ID", secret: false },
      { key: "secret", label: "Secret", secret: true },
    ],
  },
  jfrogxray: {
    label: "JFrog Xray",
    accent: "#41BF4B",
    note: "Provide your JFrog Xray Base URL, Username, and API Key.",
    fields: [
      {
        key: "baseUrl",
        label: "Base URL",
        secret: false,
        placeholder: "https://yourcompany.jfrog.io/xray",
      },
      { key: "username", label: "Username", secret: false },
      { key: "apiKey", label: "API Key", secret: true },
    ],
  },
  semgrep: {
    label: "Semgrep",
    accent: "#000000",
    note: "Provide your Semgrep Base URL, API Token, and Organization Slug.",
    fields: [
      {
        key: "baseUrl",
        label: "Base URL",
        secret: false,
        placeholder: "https://semgrep.dev/api/v1",
      },
      { key: "orgSlug", label: "Organization Slug", secret: false },
      { key: "apiToken", label: "API Token", secret: true },
    ],
  },
  bitbucket: {
    label: "Bitbucket",
    accent: "#2684FF",
    note: "Provide your Bitbucket Base URL, Workspace, Username, and App Password.",
    fields: [
      {
        key: "baseUrl",
        label: "Base URL",
        secret: false,
        placeholder: "https://api.bitbucket.org/2.0",
      },
      { key: "workspace", label: "Workspace", secret: false },
      { key: "username", label: "Username", secret: false },
      { key: "appPassword", label: "App Password", secret: true },
    ],
  },
  github: {
    label: "GitHub",
    accent: "#181717",
    note: "Provide your GitHub Base URL, Organization name, and Access Token.",
    fields: [
      {
        key: "baseUrl",
        label: "Base URL",
        secret: false,
        placeholder: "https://api.github.com",
      },
      { key: "org", label: "Organization", secret: false },
      { key: "accessToken", label: "Access Token", secret: true },
    ],
  },
  orca: {
    label: "Orca Security",
    accent: "#1A73E8",
    note: "Provide the Orca Security API base URL and your API token. You can generate a token under Settings → API in the Orca console.",
    fields: [
      {
        key: "baseUrl",
        label: "Base URL",
        secret: false,
        placeholder: "https://api.orcasecurity.io",
      },
      { key: "apiToken", label: "API Token", secret: true },
    ],
  },
  contrast: {
    label: "Contrast Security",
    accent: "#EE3124",
    note: "Provide your Contrast Security TeamServer URL, Organization ID, username, API key, and Service key. Find these under Organization Settings → API in Contrast.",
    fields: [
      {
        key: "baseUrl",
        label: "Base URL",
        secret: false,
        placeholder: "https://app.contrastsecurity.com/Contrast",
      },
      { key: "organizationId", label: "Organization ID", secret: false },
      { key: "username", label: "Username", secret: false },
      { key: "apiKey", label: "API Key", secret: true },
      { key: "serviceKey", label: "Service Key", secret: true },
    ],
  },
  aqua: {
    label: "Aqua Security",
    accent: "#007FFF",
    note: "Provide the Aqua Security console URL and your admin credentials. Ensure the account has API access enabled.",
    fields: [
      {
        key: "baseUrl",
        label: "Base URL",
        secret: false,
        placeholder: "https://your-aqua-console.cloud.aquasec.com",
      },
      { key: "username", label: "Username", secret: false },
      { key: "password", label: "Password", secret: true },
    ],
  },
  sonicwall: {
    label: "SonicWall",
    accent: "#FF6600",
    note: "Enable SonicOS API management on the appliance (System Setup → Appliance → Base Settings → \"Enable SonicOS API\"), then use your firewall admin username and password below. For local testing against the bundled mock server, set Base URL to http://localhost:8080/mock-sonicwall and use any non-empty username/password.",
    fields: [
      {
        key: "baseUrl",
        label: "SonicOS Base URL",
        secret: false,
        placeholder: "https://sonicwall.yourcompany.com:8443",
      },
      { key: "username", label: "Username", secret: false },
      { key: "password", label: "Password", secret: true },
    ],
  },
  threatconnect: {
    label: "ThreatConnect",
    accent: "#DA291C",
    note: "Generate an API User under Settings → Org Settings → Membership → API User in ThreatConnect, which issues an Access ID and Secret Key. Requests are HMAC-signed automatically — no need to paste a raw bearer token. For local testing against the bundled mock server, set Base URL to http://localhost:8080/mock-threatconnect and use any non-empty values.",
    fields: [
      {
        key: "baseUrl",
        label: "ThreatConnect Base URL",
        secret: false,
        placeholder: "https://app.threatconnect.com",
      },
      { key: "accessId", label: "Access ID", secret: false },
      { key: "secretKey", label: "Secret Key", secret: true },
    ],
  },
  forcepoint: {
    label: "Forcepoint",
    accent: "#78BE20",
    note: "Generate an API key from Forcepoint DLP Manager under Settings → General → Integration → API. For local testing against the bundled mock server, set Base URL to http://localhost:8080/mock-forcepoint and use any non-empty API key.",
    fields: [
      {
        key: "baseUrl",
        label: "Forcepoint DLP Manager URL",
        secret: false,
        placeholder: "https://forcepoint-dlp.yourcompany.com",
      },
      { key: "apiKey", label: "API Key", secret: true },
    ],
  },
  zendesk: {
    label: "Zendesk",
    accent: "#03363D",
    note: "Generate an API token from Admin Center → Apps and integrations → APIs → Zendesk API → Add API token. Authentication uses your account email paired with this token — not your login password.",
    fields: [
      {
        key: "subdomain",
        label: "Subdomain",
        secret: false,
        placeholder: "yourcompany",
      },
      {
        key: "email",
        label: "Account Email",
        secret: false,
        placeholder: "you@yourcompany.com",
      },
      { key: "apiToken", label: "API Token", secret: true },
    ],
  },
  barracuda: {
    label: "Barracuda Networks",
    accent: "#D0021B",
    note: "Generate an API token from Barracuda Cloud Control under Account → API Access, then pair it with the Serial Number of the appliance or Email Security Gateway you want to monitor. For local testing against the bundled mock server, set Base URL to http://localhost:8080/mock-barracuda and use any non-empty values.",
    fields: [
      {
        key: "baseUrl",
        label: "Barracuda Base URL",
        secret: false,
        placeholder: "https://api.barracudanetworks.com",
      },
      { key: "serialNumber", label: "Appliance Serial Number", secret: false },
      { key: "apiToken", label: "API Token", secret: true },
    ],
  },
  securonix: {
    label: "Securonix",
    accent: "#1B2A4A",
    note: "Create a REST API user under Administration → System Configuration → REST API in Securonix, which issues a token scoped to threat and incident read access. For local testing against the bundled mock server, set Base URL to http://localhost:8080/mock-securonix and use any non-empty values.",
    fields: [
      {
        key: "baseUrl",
        label: "Securonix Base URL",
        secret: false,
        placeholder: "https://yourcompany.securonix.net",
      },
      { key: "username", label: "API Username", secret: false },
      { key: "apiToken", label: "API Token", secret: true },
    ],
  },
  forgerock: {
    label: "ForgeRock",
    accent: "#00B48D",
    note: "Register an OAuth2 client in the ForgeRock Identity Platform admin console with read scopes over identities and access policies, then paste the Client ID and Secret below. For local testing against the bundled mock server, set Base URL to http://localhost:8080/mock-forgerock and use any non-empty values.",
    fields: [
      {
        key: "baseUrl",
        label: "ForgeRock Base URL",
        secret: false,
        placeholder: "https://openam.yourcompany.com",
      },
      { key: "clientId", label: "Client ID", secret: false },
      { key: "clientSecret", label: "Client Secret", secret: true },
    ],
  },
  keepersecurity: {
    label: "Keeper Security",
    accent: "#FF3D3D",
    note: "Create a dedicated Keeper Security admin service account and generate credentials under Admin Console → Secrets Manager → Applications. For local testing against the bundled mock server, set Base URL to http://localhost:8080/mock-keepersecurity and use any non-empty values.",
    fields: [
      {
        key: "baseUrl",
        label: "Keeper Base URL",
        secret: false,
        placeholder: "https://keepersecurity.com/api/v2",
      },
      { key: "domain", label: "Account Domain", secret: false, placeholder: "yourcompany.keeper.com" },
      { key: "apiKey", label: "API Key", secret: true },
    ],
  },
};

export default function BuiltInProviderForm({
  providerKey,
  configKey,
  savedConfig,
  onSave,
  onRemove,
  onTest,
}) {
  const provider = PROVIDERS[providerKey];

  if (!provider) {
    return (
      <Alert severity="warning" sx={{ borderRadius: "8px" }}>
        No configuration form has been defined for "{providerKey}" yet.
      </Alert>
    );
  }

  const saved = savedConfig?.[configKey ?? providerKey];
  const isConnected = !!saved;

  const initForm = () => {
    const form = {};
    provider.fields.forEach((f) => {
      form[f.key] = f.secret ? "" : (saved?.[f.key] ?? "");
    });
    return form;
  };

  const [form, setForm] = useState(initForm);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [alert, setAlert] = useState(null);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setAlert(null);
    try {
      const payload = {};
      provider.fields.forEach((f) => {
        const val = form[f.key];
        if (f.secret && (!val || val.trim() === "")) return;
        if (f.key === "evidenceBuckets") {
          payload[f.key] = val
            ? val
                .split(",")
                .map((b) => b.trim())
                .filter(Boolean)
            : [];
        } else {
          payload[f.key] = val;
        }
      });
      const data = await onSave(providerKey, payload);
      setAlert({
        type: data.success ? "success" : "error",
        message: data.message,
      });
    } catch {
      setAlert({ type: "error", message: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setAlert(null);
    try {
      const data = await onTest(providerKey);
      setAlert({
        type: data.success ? "success" : "error",
        message: data.message,
      });
    } catch {
      setAlert({ type: "error", message: "Connection test failed." });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Box>
      {/* Status row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          p: 2,
          borderRadius: "10px",
          background: isConnected
            ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
            : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          border: `1px solid ${isConnected ? "#bbf7d0" : "#e2e8f0"}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: isConnected ? "#22c55e" : "#cbd5e1",
              boxShadow: isConnected ? "0 0 0 3px #dcfce7" : "none",
            }}
          />
          <Typography
            variant="body2"
            fontWeight={600}
            color={isConnected ? "#15803d" : "text.secondary"}
          >
            {isConnected ? "Connected" : "Not configured"}
          </Typography>
        </Box>
        {isConnected && (
          <Typography variant="caption" color="text.secondary">
            Credentials encrypted · Last updated on save
          </Typography>
        )}
      </Box>

      {/* Setup note */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: "8px",
          background: "#f8fafc",
          borderLeft: `3px solid ${provider.accent}`,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ lineHeight: 1.6 }}
        >
          {provider.note}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Fields */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {provider.fields.map((f) => (
          <TextField
            key={f.key}
            label={f.label}
            value={form[f.key] ?? ""}
            onChange={set(f.key)}
            type={f.secret ? "password" : "text"}
            multiline={!!f.multiline}
            rows={f.multiline ? 5 : 1}
            placeholder={
              f.secret && isConnected
                ? "Leave blank to keep existing value"
                : (f.placeholder ?? "")
            }
            size="small"
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                fontSize: "0.875rem",
                "&:hover fieldset": { borderColor: provider.accent },
                "&.Mui-focused fieldset": { borderColor: provider.accent },
              },
              "& label.Mui-focused": { color: provider.accent },
            }}
          />
        ))}
      </Box>

      {alert && (
        <Alert severity={alert.type} sx={{ mt: 2.5, borderRadius: "8px" }}>
          {alert.message}
        </Alert>
      )}

      {/* Actions */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          mt: 3,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={
            saving ? (
              <CircularProgress size={14} color="inherit" />
            ) : (
              <SaveOutlinedIcon />
            )
          }
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.85rem",
            background: provider.accent,
            "&:hover": {
              background: provider.accent,
              filter: "brightness(0.9)",
            },
            "&:disabled": { opacity: 0.6 },
          }}
        >
          {saving ? "Saving…" : "Save credentials"}
        </Button>
        {isConnected && (
          <>
            <Button
              variant="outlined"
              onClick={handleTest}
              disabled={testing}
              startIcon={
                testing ? <CircularProgress size={14} /> : <WifiTetheringIcon />
              }
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.85rem",
                borderColor: provider.accent,
                color: provider.accent,
                "&:hover": {
                  borderColor: provider.accent,
                  background: `${provider.accent}10`,
                },
              }}
            >
              {testing ? "Testing…" : "Test connection"}
            </Button>
            <Button
              variant="text"
              color="error"
              onClick={() => onRemove(providerKey)}
              startIcon={<LinkOffIcon />}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.85rem",
                ml: "auto",
              }}
            >
              Disconnect
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}