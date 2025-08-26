"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea"; 
import { Switch } from "@/app/components/ui/switch";
import { useToast } from "@/app/components/ui/use-toast";
import { Save, Settings } from "lucide-react";

interface Settings {
  siteName: string;
  siteDescription: string;
  currency: string;
  taxRate: string;
  shippingFeeKanpur: string;
  shippingFeeOthers: string;
  freeShippingThreshold: string;
  sameDayCutoffTime: string;
  allowGuestCheckout: string;
  requireEmailVerification: string;
  maintenanceMode: string;
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>({
    siteName: "",
    siteDescription: "",
    currency: "INR",
    taxRate: "18",
    shippingFeeKanpur: "99",
    shippingFeeOthers: "150",
    freeShippingThreshold: "2000",
    sameDayCutoffTime: "14:00",
    allowGuestCheckout: "true",
    requireEmailVerification: "false",
    maintenanceMode: "false",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Settings saved successfully" });
      } else {
        toast({
          title: "Error",
          description: "Failed to save settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof Settings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded animate-pulse mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-10 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your store settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => updateSetting("siteName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={settings.currency}
                  onChange={(e) => updateSetting("currency", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) =>
                  updateSetting("siteDescription", e.target.value)
                }
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Tax */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Tax</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => updateSetting("taxRate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="shippingFeeKanpur">Kanpur Shipping (₹)</Label>
                <Input
                  id="shippingFeeKanpur"
                  type="number"
                  value={settings.shippingFeeKanpur}
                  onChange={(e) =>
                    updateSetting("shippingFeeKanpur", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="shippingFeeOthers">
                  Other Cities Shipping (₹)
                </Label>
                <Input
                  id="shippingFeeOthers"
                  type="number"
                  value={settings.shippingFeeOthers}
                  onChange={(e) =>
                    updateSetting("shippingFeeOthers", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="freeShippingThreshold">
                  Free Shipping Threshold (₹)
                </Label>
                <Input
                  id="freeShippingThreshold"
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) =>
                    updateSetting("freeShippingThreshold", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="sameDayCutoffTime">Same Day Cutoff Time</Label>
                <Input
                  id="sameDayCutoffTime"
                  type="time"
                  value={settings.sameDayCutoffTime}
                  onChange={(e) =>
                    updateSetting("sameDayCutoffTime", e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Store Options */}
        <Card>
          <CardHeader>
            <CardTitle>Store Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowGuestCheckout">Allow Guest Checkout</Label>
                <p className="text-sm text-muted-foreground">
                  Allow customers to checkout without creating an account
                </p>
              </div>
              <Switch
                id="allowGuestCheckout"
                checked={settings.allowGuestCheckout === "true"}
                onCheckedChange={(checked) =>
                  updateSetting("allowGuestCheckout", checked.toString())
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireEmailVerification">
                  Require Email Verification
                </Label>
                <p className="text-sm text-muted-foreground">
                  Require customers to verify their email before ordering
                </p>
              </div>
              <Switch
                id="requireEmailVerification"
                checked={settings.requireEmailVerification === "true"}
                onCheckedChange={(checked) =>
                  updateSetting("requireEmailVerification", checked.toString())
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Put the store in maintenance mode
                </p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode === "true"}
                onCheckedChange={(checked) =>
                  updateSetting("maintenanceMode", checked.toString())
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
