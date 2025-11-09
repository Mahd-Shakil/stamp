import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Navbar() {
    return (
        <nav className="absolute top-0 left-0 right-0 z-50 border-b border-border/40 bg-transparent">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-1">
                        <svg fill="#363030" viewBox="-17.14 0 168.786 168.786" xmlns="http://www.w3.org/2000/svg" stroke="#363030" className="h-8 w-8 text-foreground">
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="8.101728">
                                <path id="stamp" d="M278.066,1084.939l-.085-22.623-40.74-40.886a28.033,28.033,0,0,0-55.606,5.026,27.607,27.607,0,0,0,7.933,19.57v6.557l-46,35.384v22.622l4,4.015v12.333l40.229,40.3,86.229-66.267-.033-12.917Zm-126.5,14.7,32,32.229v7.527l-32-32.113Zm118.381-27.776,0,9.145-78.383,60.235v-9.022Zm-60.247-65.41a20,20,0,1,1-20,20A20.024,20.024,0,0,1,209.7,1006.456Zm-12.134,45.293a29.055,29.055,0,0,0,12,2.707,26.511,26.511,0,0,0,11-2.253v17.92a9.186,9.186,0,0,1-9.2,9.28h-4.334a9.414,9.414,0,0,1-9.467-9.28Zm9.467,35.654h4.334a17.193,17.193,0,0,0,17.2-17.28V1047a28.825,28.825,0,0,0,8.391-14.451l30.831,30.907-79.733,61.464-34.393-34.58,35.9-27.663v7.447A17.422,17.422,0,0,0,207.035,1087.4Z" transform="translate(-143.568 -998.456)"></path>
                            </g>
                            <g id="SVGRepo_iconCarrier">
                                <path id="stamp" d="M278.066,1084.939l-.085-22.623-40.74-40.886a28.033,28.033,0,0,0-55.606,5.026,27.607,27.607,0,0,0,7.933,19.57v6.557l-46,35.384v22.622l4,4.015v12.333l40.229,40.3,86.229-66.267-.033-12.917Zm-126.5,14.7,32,32.229v7.527l-32-32.113Zm118.381-27.776,0,9.145-78.383,60.235v-9.022Zm-60.247-65.41a20,20,0,1,1-20,20A20.024,20.024,0,0,1,209.7,1006.456Zm-12.134,45.293a29.055,29.055,0,0,0,12,2.707,26.511,26.511,0,0,0,11-2.253v17.92a9.186,9.186,0,0,1-9.2,9.28h-4.334a9.414,9.414,0,0,1-9.467-9.28Zm9.467,35.654h4.334a17.193,17.193,0,0,0,17.2-17.28V1047a28.825,28.825,0,0,0,8.391-14.451l30.831,30.907-79.733,61.464-34.393-34.58,35.9-27.663v7.447A17.422,17.422,0,0,0,207.035,1087.4Z" transform="translate(-143.568 -998.456)"></path>
                            </g>
                        </svg>
                        <span className="font-mono text-xl font-bold text-foreground">stamp.</span>
                    </Link>



                    {/* Right Side - Login & Register */}
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" asChild className="font-mono text-sm">
                            <Link href="/login">Login</Link>
                        </Button>
                        <Button
                            size="sm"
                            asChild
                            className="border-2 border-border bg-background font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <Link href="/signup">Register</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
