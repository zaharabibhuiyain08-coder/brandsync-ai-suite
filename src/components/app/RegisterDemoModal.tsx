import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { z } from "zod";

const INDUSTRIES = [
  "Technology / SaaS", "E-commerce / D2C", "Retail", "Fashion & Beauty", "Food & Beverage",
  "Finance / Fintech", "Healthcare", "Education", "Real Estate", "Travel & Hospitality",
  "Media & Entertainment", "Manufacturing", "Agency / Consulting", "Non-profit", "Other",
];

const EMPLOYEE_SIZES = ["1–10", "11–50", "51–200", "201–500", "501–1,000", "1,000+"];

const googleSchema = z.object({
  brandName: z.string().trim().min(1, "Brand name is required").max(120),
  industry: z.string().min(1, "Choose an industry"),
  employeeSize: z.string().min(1, "Choose company size"),
  websiteUrl: z.string().trim().max(255).optional().or(z.literal("")),
});

const createSchema = z.object({
  brandName: z.string().trim().min(1, "Brand name is required").max(120),
  contact: z.string().trim().min(3, "Email or phone is required").max(150),
  industry: z.string().min(1, "Choose an industry"),
  employeeSize: z.string().min(1, "Choose company size"),
  websiteUrl: z.string().trim().max(255).optional().or(z.literal("")),
  password: z.string().min(8, "Min 8 characters").max(72),
});

function GoogleIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.2s2.7-6.2 6-6.2c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z"/>
    </svg>
  );
}

type Mode = "choose" | "google" | "create" | "success";

export function RegisterDemoModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [mode, setMode] = useState<Mode>("choose");

  const reset = () => setMode("choose");
  const handleOpenChange = (v: boolean) => {
    if (!v) setTimeout(reset, 200);
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px] glass-strong border-white/10">
        {mode === "choose" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" /> Start your free demo
              </DialogTitle>
              <DialogDescription>
                Get instant access to BrandSync AI. No credit card required.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="google" className="mt-2">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="google">Continue with Google</TabsTrigger>
                <TabsTrigger value="create">Create account</TabsTrigger>
              </TabsList>
              <TabsContent value="google" className="mt-4">
                <button
                  onClick={() => setMode("google")}
                  className="w-full inline-flex items-center justify-center gap-3 rounded-lg bg-white text-black font-medium h-11 hover:bg-white/90 transition"
                >
                  <GoogleIcon /> Continue with Google
                </button>
                <p className="mt-3 text-xs text-muted-foreground text-center">
                  We'll ask a few quick questions about your brand to personalize your dashboard.
                </p>
              </TabsContent>
              <TabsContent value="create" className="mt-4">
                <Button onClick={() => setMode("create")} className="w-full h-11 bg-gradient-to-r from-indigo-500 to-purple-600">
                  Create your account
                </Button>
                <p className="mt-3 text-xs text-muted-foreground text-center">
                  Use email or phone — your choice.
                </p>
              </TabsContent>
            </Tabs>
          </>
        )}

        {mode === "google" && (
          <GoogleForm onBack={() => setMode("choose")} onDone={() => setMode("success")} />
        )}
        {mode === "create" && (
          <CreateForm onBack={() => setMode("choose")} onDone={() => setMode("success")} />
        )}
        {mode === "success" && <SuccessPanel onClose={() => handleOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-rose-400 mt-1">{msg}</p>;
}

function GoogleForm({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [values, setValues] = useState({ brandName: "", industry: "", employeeSize: "", websiteUrl: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = googleSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    toast.success("Welcome to BrandSync AI!");
    onDone();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg flex items-center gap-2">
          <GoogleIcon /> Tell us about your brand
        </DialogTitle>
        <DialogDescription>Signed in with Google. A few details and you're in.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="mt-2 space-y-4">
        <div>
          <Label>Brand or Company Name</Label>
          <Input value={values.brandName} onChange={(e) => setValues({ ...values, brandName: e.target.value })} placeholder="Acme Corporation" />
          <FieldError msg={errors.brandName} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Industry</Label>
            <Select value={values.industry} onValueChange={(v) => setValues({ ...values, industry: v })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
            </Select>
            <FieldError msg={errors.industry} />
          </div>
          <div>
            <Label>Employee Size</Label>
            <Select value={values.employeeSize} onValueChange={(v) => setValues({ ...values, employeeSize: v })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{EMPLOYEE_SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <FieldError msg={errors.employeeSize} />
          </div>
        </div>
        <div>
          <Label>Website URL <span className="text-muted-foreground font-normal">(Optional)</span></Label>
          <Input value={values.websiteUrl} onChange={(e) => setValues({ ...values, websiteUrl: e.target.value })} placeholder="https://www.acmecorp.com" />
        </div>
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onBack}>Back</Button>
          <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600">
            {loading ? "Setting up..." : "Launch my dashboard"}
          </Button>
        </div>
      </form>
    </>
  );
}

function CreateForm({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [values, setValues] = useState({ brandName: "", contact: "", industry: "", employeeSize: "", websiteUrl: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = createSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    toast.success("Account created! Welcome aboard.");
    onDone();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg">Create your free account</DialogTitle>
        <DialogDescription>Takes under a minute. No credit card.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="mt-2 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        <div>
          <Label>Company or Brand Name</Label>
          <Input value={values.brandName} onChange={(e) => setValues({ ...values, brandName: e.target.value })} placeholder="Acme Corporation" />
          <FieldError msg={errors.brandName} />
        </div>
        <div>
          <Label>Email or Phone Number</Label>
          <Input value={values.contact} onChange={(e) => setValues({ ...values, contact: e.target.value })} placeholder="you@brand.com or +1 555 0100" />
          <FieldError msg={errors.contact} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Industry</Label>
            <Select value={values.industry} onValueChange={(v) => setValues({ ...values, industry: v })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
            </Select>
            <FieldError msg={errors.industry} />
          </div>
          <div>
            <Label>Employee Size</Label>
            <Select value={values.employeeSize} onValueChange={(v) => setValues({ ...values, employeeSize: v })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{EMPLOYEE_SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <FieldError msg={errors.employeeSize} />
          </div>
        </div>
        <div>
          <Label>Website URL <span className="text-muted-foreground font-normal">(Optional)</span></Label>
          <Input value={values.websiteUrl} onChange={(e) => setValues({ ...values, websiteUrl: e.target.value })} placeholder="https://www.acmecorp.com" />
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} placeholder="Min 8 characters" />
          <FieldError msg={errors.password} />
        </div>
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onBack}>Back</Button>
          <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600">
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </div>
      </form>
    </>
  );
}

function SuccessPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="text-center py-4">
      <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500/15 grid place-items-center mb-3">
        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
      </div>
      <DialogTitle className="text-xl">You're all set!</DialogTitle>
      <DialogDescription className="mt-2">
        Your free demo workspace is ready. Mr. Zarvis will guide you from here.
      </DialogDescription>
      <div className="mt-5 flex flex-col gap-2">
        <a href="/dashboard/intelligence" className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 h-11 font-medium">
          Open my dashboard
        </a>
        <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">Close</button>
      </div>
    </div>
  );
}
