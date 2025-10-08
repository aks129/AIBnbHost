import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';

const messagePreferencesSchema = z.object({
  autoReplyEnabled: z.boolean(),
  responseDelayMinutes: z.number().min(0).max(1440),
  businessHoursStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  businessHoursEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

type MessagePreferencesData = z.infer<typeof messagePreferencesSchema>;

interface MessagePreferencesStepProps {
  onNext: (data: MessagePreferencesData) => void;
  onBack: () => void;
  initialData?: Partial<MessagePreferencesData>;
}

export function MessagePreferencesStep({ onNext, onBack, initialData }: MessagePreferencesStepProps) {
  const form = useForm<MessagePreferencesData>({
    resolver: zodResolver(messagePreferencesSchema),
    defaultValues: {
      autoReplyEnabled: initialData?.autoReplyEnabled ?? true,
      responseDelayMinutes: initialData?.responseDelayMinutes ?? 15,
      businessHoursStart: initialData?.businessHoursStart ?? '09:00',
      businessHoursEnd: initialData?.businessHoursEnd ?? '21:00',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
        <FormField
          control={form.control}
          name="autoReplyEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Enable Auto-Reply</FormLabel>
                <FormDescription>
                  Automatically respond to guest messages using AI
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="responseDelayMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Response Delay (minutes)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={1440}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                Wait time before sending automated responses (0 = instant)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="businessHoursStart"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Hours Start</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormDescription>
                  Auto-reply start time
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessHoursEnd"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Hours End</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormDescription>
                  Auto-reply end time
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> You can customize message templates and adjust these settings anytime from your dashboard.
          </p>
        </div>

        <div className="flex gap-3">
          <Button type="button" onClick={onBack} variant="outline" className="flex-1">
            Back
          </Button>
          <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
