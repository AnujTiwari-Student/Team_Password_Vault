// import { getOrgById } from "@/data/org-data";
// import { prisma } from "@/db";
// import { currentUser } from "@/lib/current-user";
// import { NextResponse } from "next/server";

// export async function POST(request: Request) {
//   try {
//     const user = await currentUser();

//     if (!user || !user.id || !user.email) {
//       return NextResponse.json(
//         { error: "Unauthorized or missing session data" },
//         { status: 401 }
//       );
//     }

//     const body = await request.json();
//     const { name, type } = body;

//     if (!name || !type) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     const result = await prisma.$transaction(async (tx) => {
//       if (type === "personal") {
//         const vault = await tx.vault.create({
//           data: {
//             user_id: user.id!,
//             name: `${name} Vault`,
//             type: "personal",
//             org_id: null,
//             ovk_id: null,
//           },
//         });

//         await tx.logs.create({
//           data: {
//             event: "Vault Created",
//             metadata: {
//               vault_id: vault.id,
//               created_by: user.id,
//               vault_type: "personal",
//               vault_name: name,
//             },
//           },
//         });

//         return vault;
//       } else if (type === "org") {
//         const org = await getOrgById(user.id!);

//         const vault = await tx.vault.create({
//           data: {
//             user_id: user.id!,
//             name: `${name} Vault`,
//             type: "org",
//             org_id: org?.id,
//             ovk_id: org?.id,
//           },
//         });

//         await tx.logs.create({
//           data: {
//             event: "Vault Created",
//             metadata: {
//               vault_id: vault.id,
//               created_by: user.id,
//               vault_type: "org",
//               vault_name: name,
//             },
//           },
//         });

//         return vault;
//       } else {
//         await tx.logs.create({
//           data: {
//             event: "Vault Creation Failed",
//             metadata: {
//               created_by: user.id,
//               vault_type: type,
//               vault_name: name,
//             },
//           },
//         });
//         throw new Error("Invalid vault type");
//       }
//     });

//     return NextResponse.json(
//       { message: "Vault created successfully", vault: result },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error creating vault:", error);
//     return NextResponse.json(
//       // @ts-expect-error Error is a string
//       { error: "Internal server error", details: error.message },
//       { status: 500 }
//     );
//   }
// }
