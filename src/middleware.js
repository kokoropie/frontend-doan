import { NextResponse } from "next/server";
import axios from "axios";

// Add cache to prevent frequent API calls
const AUTH_CACHE_DURATION = 30; // seconds
const authCache = new Map();

export async function middleware(request) {
    console.log(request.headers)
    if (request.headers.get("next-router-prefetch")) {
        return NextResponse.next();
    }
    if (!request.nextUrl.pathname.startsWith("/_next")) {
        if (request.nextUrl.pathname === "/") {
            return NextResponse.redirect(new URL("/app", request.url));
        } else if (request.nextUrl.pathname.startsWith("/auth/logout")) {
            
            axios.delete(
                `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/logout`, {
                    headers: {
                        Authorization: `Bearer ${request.cookies.get("token")?.value}`
                    },
                },
            );
            const response = NextResponse.redirect(new URL("/auth/login", request.url));
            response.cookies.delete("token");
            return response;
        } else if (request.nextUrl.pathname.startsWith("/app/verify-email")) {
            // const token = request.nextUrl.searchParams.get("token");
            // if (!token) {
            //     return NextResponse.redirect(
            //         new URL(
            //             "/auth/verification-error?error=Token not found",
            //             request.url,
            //         ),
            //     );
            // }

            // try {
            //     const verificationResponse = await fetch(
            //         `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/verify-email?token=${token}`,
            //         {
            //             method: "GET",
            //         },
            //     );

            //     if (verificationResponse.ok) {
            //         return NextResponse.redirect(
            //             new URL("/auth/verification-success", request.url),
            //         );
            //     } else {
            //         const error = await verificationResponse.json();
            //         return NextResponse.redirect(
            //             new URL(
            //                 `/auth/verification-error?error=${encodeURIComponent(error.message)}`,
            //                 request.url,
            //             ),
            //         );
            //     }
            // } catch (error) {
            //     return NextResponse.redirect(
            //         new URL(
            //             "/auth/verification-error?error=Verification process failed",
            //             request.url,
            //         ),
            //     );
            // }
        } else if (request.nextUrl.pathname.startsWith("/auth")) {
            const token = request.cookies.get("token")?.value;
            if (token) {
                return NextResponse.redirect(new URL("/app", request.url));
            }
        } else if (request.nextUrl.pathname.startsWith("/app")) {
            const token = request.cookies.get("token")?.value;
            if (!token) {
                return NextResponse.redirect(new URL("/auth/login", request.url));
            }

            // // Check cache first
            // const cachedAuth = authCache.get(token);
            // if (cachedAuth && Date.now() - cachedAuth.timestamp < AUTH_CACHE_DURATION * 1000) {
            //     return cachedAuth.isValid
            //         ? NextResponse.next()
            //         : NextResponse.redirect(new URL("/auth/login", request.url));
            // }

            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/profile`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                    },
                );
    
                // Update cache
                authCache.set(token, {
                    timestamp: Date.now(),
                    isValid: res.status != 200,
                });
    
                if (res.status != 200) {
                    return NextResponse.redirect(new URL("/auth/login", request.url));
                }
            } catch (error) {
                console.error("Error validating token:", error);
            }
        }
    }

    return NextResponse.next();
}
