import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { UserRepo } from "../repos/user.repo.js";
import { InviteRepo } from "../repos/invite.repo.js";
import { SubscriptionRepo } from "../repos/subscription.repo.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import { toMysqlDateTime } from "../utils/time.js";
import { pool } from "../config/db.js";

export const AuthService = {
  async login(email, password) {
    const user = await UserRepo.getByEmail(email);
    if (!user) throw Object.assign(new Error("Invalid credentials"), { status: 401 });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw Object.assign(new Error("Invalid credentials"), { status: 401 });

    const accessToken = signAccessToken({ sub: user.id, role: user.role_name });
    const refreshToken = signRefreshToken({ sub: user.id, role: user.role_name });

    return { user: sanitizeUser(user), accessToken, refreshToken };
  },

  async register({ email, password, name, inviteCode }) {
    const existing = await UserRepo.getByEmail(email);
    if (existing) throw Object.assign(new Error("Email already registered"), { status: 409 });

    const invite = await InviteRepo.getByCode(inviteCode);
    if (!invite) throw Object.assign(new Error("Invalid invite code"), { status: 400 });
    if (invite.is_used) throw Object.assign(new Error("Invite code already used"), { status: 400 });
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) throw Object.assign(new Error("Invite code expired"), { status: 400 });

    // Determine role 'user'
    const [roleRows] = await pool.query(`SELECT id FROM roles WHERE name='user' LIMIT 1`);
    const roleId = roleRows[0].id;

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();
    const trialEnds = new Date(now);
    trialEnds.setDate(trialEnds.getDate() + 3);

    const userId = await UserRepo.createUser({
      roleId,
      email,
      passwordHash,
      name,
      invitedByUserId: invite.generated_by_user_id,
      trialEndsAt: toMysqlDateTime(trialEnds)
    });

    await InviteRepo.markUsed(invite.id, userId);

    // create subscription record for trial
    await SubscriptionRepo.create({
      userId,
      source: "trial",
      startsAt: toMysqlDateTime(now),
      endsAt: toMysqlDateTime(trialEnds),
      requestId: null
    });

    const user = await UserRepo.getById(userId);
    const accessToken = signAccessToken({ sub: user.id, role: user.role_name });
    const refreshToken = signRefreshToken({ sub: user.id, role: user.role_name });

    return { user: sanitizeUser(user), accessToken, refreshToken };
  }
};

function sanitizeUser(u) {
  const { password_hash, ...rest } = u;
  return rest;
}
