import { pgTable, text, timestamp, uuid, integer, varchar, boolean } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { relations } from "drizzle-orm";

export const recipeBinders = pgTable("recipe_binders", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  userId: uuid("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const recipes = pgTable("recipes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  binderId: uuid("binder_id").references(() => recipeBinders.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const recipeIngredients = pgTable("recipe_ingredients", {
  id: uuid("id").defaultRandom().primaryKey(),
  recipeId: uuid("recipe_id").references(() => recipes.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  amount: varchar("amount", { length: 50 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const recipeSteps = pgTable("recipe_steps", {
  id: uuid("id").defaultRandom().primaryKey(),
  recipeId: uuid("recipe_id").references(() => recipes.id).notNull(),
  stepNumber: integer("step_number").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const recipeShares = pgTable("recipe_shares", {
  id: uuid("id").defaultRandom().primaryKey(),
  binderId: uuid("binder_id").notNull().references(() => recipeBinders.id, { onDelete: "cascade" }),
  shareLink: text("share_link").notNull(),
  requireLogin: boolean("require_login").default(false),
  sharedWithId: uuid("shared_with_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 定义表之间的关系
export const recipeBinderRelations = relations(recipeBinders, ({ many }) => ({
  recipes: many(recipes),
}));

export const recipeRelations = relations(recipes, ({ one, many }) => ({
  binder: one(recipeBinders, {
    fields: [recipes.binderId],
    references: [recipeBinders.id],
  }),
  ingredients: many(recipeIngredients),
  steps: many(recipeSteps),
}));

export const recipeIngredientRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredients.recipeId],
    references: [recipes.id],
  }),
}));

export const recipeStepRelations = relations(recipeSteps, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeSteps.recipeId],
    references: [recipes.id],
  }),
}));

export const recipeShareRelations = relations(recipeShares, ({ one }) => ({
  binder: one(recipeBinders, {
    fields: [recipeShares.binderId],
    references: [recipeBinders.id],
  }),
})); 