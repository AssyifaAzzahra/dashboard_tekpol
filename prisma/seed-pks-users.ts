import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "Tekpol@123";

const PKS_USERS = [
  { email: "tpu@tekpol.co.id", name: "PKS TPU - Tanah Putih", pksCode: "TPU" },
  { email: "tme@tekpol.co.id", name: "PKS TME - Tanjung Medan", pksCode: "TME" },
  { email: "sgh@tekpol.co.id", name: "PKS SGH - Sei Galuh", pksCode: "SGH" },
  { email: "spa@tekpol.co.id", name: "PKS SPA - Sei Pagar", pksCode: "SPA" },
  { email: "sgo@tekpol.co.id", name: "PKS SGO - Sei Garo", pksCode: "SGO" },
  { email: "sbt@tekpol.co.id", name: "PKS SBT - Sei Buatan", pksCode: "SBT" },
  { email: "lda@tekpol.co.id", name: "PKS LDA - Lubum Dalam", pksCode: "LDA" },
  { email: "tan@tekpol.co.id", name: "PKS TAN - Tandun", pksCode: "TAN" },
  { email: "ter@tekpol.co.id", name: "PKS TER - Terantam", pksCode: "TER" },
  { email: "sta@tekpol.co.id", name: "PKS STA - Sei Tapung", pksCode: "STA" },
  { email: "sro@tekpol.co.id", name: "PKS SRO - Sei Rokan", pksCode: "SRO" },
  { email: "sin@tekpol.co.id", name: "PKS SIN - Sei Intan", pksCode: "SIN" },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const u of PKS_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: "KARYAWAN",
        pksCode: u.pksCode,
        passwordHash,
      },
      create: {
        name: u.name,
        email: u.email,
        role: "KARYAWAN",
        pksCode: u.pksCode,
        passwordHash,
      },
    });
  }

  console.log("✅ 12 akun PKS berhasil dibuat/diupdate");
  console.log("🔑 Password default:", DEFAULT_PASSWORD);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
