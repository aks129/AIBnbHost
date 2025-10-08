import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';

const propertySetupSchema = z.object({
  propertyType: z.string().min(1, 'Please select a property type'),
  numberOfProperties: z.number().min(1, 'Must have at least 1 property').max(100),
  primaryLocation: z.string().min(2, 'Please enter your primary location'),
});

type PropertySetupData = z.infer<typeof propertySetupSchema>;

interface PropertySetupStepProps {
  onNext: (data: PropertySetupData) => void;
  initialData?: Partial<PropertySetupData>;
}

export function PropertySetupStep({ onNext, initialData }: PropertySetupStepProps) {
  const form = useForm<PropertySetupData>({
    resolver: zodResolver(propertySetupSchema),
    defaultValues: {
      propertyType: initialData?.propertyType || '',
      numberOfProperties: initialData?.numberOfProperties || 1,
      primaryLocation: initialData?.primaryLocation || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
        <FormField
          control={form.control}
          name="propertyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="entire-home">Entire Home</SelectItem>
                  <SelectItem value="private-room">Private Room</SelectItem>
                  <SelectItem value="shared-room">Shared Room</SelectItem>
                  <SelectItem value="vacation-rental">Vacation Rental</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                What type of property are you hosting?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numberOfProperties"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Properties</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                />
              </FormControl>
              <FormDescription>
                How many properties do you manage on Airbnb?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="primaryLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., San Francisco, CA" {...field} />
              </FormControl>
              <FormDescription>
                Where is your main property located?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
