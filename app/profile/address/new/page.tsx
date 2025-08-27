"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Switch } from "@/app/components/ui/switch";
import { useToast } from "@/app/components/ui/use-toast";

export default function NewAddressPage() {
  const { status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated")
      router.push("/login?callbackUrl=/profile/address/new");
  }, [status, router]);

  const onSave = async () => {
    if (
      !fullName ||
      !phone ||
      !addressLine1 ||
      !city ||
      !state ||
      !postalCode
    ) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/profile/address/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          addressLine1,
          addressLine2,
          city,
          state,
          postalCode,
          country,
          isDefault,
        }),
      });
      if (res.ok) {
        toast({ title: "Address added" });
        router.push("/profile");
      } else {
        const e = await res.json();
        toast({
          title: "Error",
          description: e.error || "Failed to add address",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="line1">Address Line 1 *</Label>
              <Input
                id="line1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="line2">Address Line 2</Label>
              <Input
                id="line2"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Uttar Pradesh",
                    "Delhi",
                    "Maharashtra",
                    "Karnataka",
                    "Tamil Nadu",
                    "West Bengal",
                    "Gujarat",
                    "Rajasthan",
                    "Punjab",
                    "Haryana",
                  ].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="pin">PIN Code *</Label>
              <Input
                id="pin"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between border rounded p-3">
            <div>
              <Label>Set as default</Label>
              <p className="text-sm text-muted-foreground">
                Use this address for future orders
              </p>
            </div>
            <Switch checked={isDefault} onCheckedChange={setIsDefault} />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.push("/profile")}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={saving}>
              {saving ? "Saving…" : "Save Address"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
