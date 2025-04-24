"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { updateRecipe } from "@/app/actions/recipes";
import { useRouter } from "next/navigation";

interface Ingredient {
  id?: string;
  name: string;
  amount: string;
  unit: string;
}

interface Step {
  id?: string;
  stepNumber: number;
  description: string;
}

interface RecipeFormProps {
  initialData: {
    name: string;
    description?: string;
    ingredients: Ingredient[];
    steps: Step[];
  };
  recipeId: string;
  binderId: string;
}

interface FormState {
  success?: boolean;
  error?: string;
  redirectUrl?: string;
}

export function RecipeForm({ initialData, recipeId, binderId }: RecipeFormProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialData.ingredients);
  const [steps, setSteps] = useState<Step[]>(initialData.steps);
  const [state, formAction] = useFormState<FormState>(updateRecipe as any, {});
  const router = useRouter();

  useEffect(() => {
    if (state?.success && state.redirectUrl) {
      router.push(state.redirectUrl);
    }
  }, [state, router]);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "", unit: "" }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addStep = () => {
    setSteps([...steps, { stepNumber: steps.length + 1, description: "" }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="recipeId" value={recipeId} />
      <input type="hidden" name="binderId" value={binderId} />

      {state?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{state.error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Recipe Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={initialData.name}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initialData.description || ""}
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Ingredients</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addIngredient}
          >
            Add Ingredient
          </Button>
        </div>
        <div className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2">
              <Input
                name={`ingredients[${index}][name]`}
                defaultValue={ingredient.name}
                placeholder="Name"
                required
              />
              <Input
                name={`ingredients[${index}][amount]`}
                defaultValue={ingredient.amount}
                placeholder="Amount"
                required
              />
              <Input
                name={`ingredients[${index}][unit]`}
                defaultValue={ingredient.unit}
                placeholder="Unit"
                required
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeIngredient(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Steps</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addStep}
          >
            Add Step
          </Button>
        </div>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-2">
              <Input
                name={`steps[${index}][stepNumber]`}
                type="number"
                defaultValue={step.stepNumber}
                placeholder="Step Number"
                required
              />
              <Textarea
                name={`steps[${index}][description]`}
                defaultValue={step.description}
                placeholder="Description"
                required
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeStep(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
} 