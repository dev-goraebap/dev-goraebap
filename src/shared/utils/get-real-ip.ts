// prettier-ignore
export function getRealClientIp(request: any): string {
 // 프록시 헤더들을 우선순위대로 확인
 const forwardedFor = request.headers['x-forwarded-for'];
 if (forwardedFor) {
   // 첫 번째 IP가 실제 클라이언트 IP
   const ips = forwardedFor.split(',').map((ip) => ip.trim());
   return ips[0];
 }

 const realIp = request.headers['x-real-ip'];
 if (realIp) {
   return realIp;
 }

 // Cloudflare 사용시
 const cfConnectingIp = request.headers['cf-connecting-ip'];
 if (cfConnectingIp) {
   return cfConnectingIp;
 }

 // AWS ALB 사용시
 const xForwarded = request.headers['x-forwarded'];
 if (xForwarded) {
   return xForwarded.split(',')[0].trim();
 }

 // 기본값 (Docker 내부 IP일 가능성 높음)
 return request.ip || request.connection?.remoteAddress || 'unknown';
}
