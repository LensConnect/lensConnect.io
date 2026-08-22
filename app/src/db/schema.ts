import { int, mysqlTable, varchar, mysqlEnum, date, timestamp ,boolean, json, } from 'drizzle-orm/mysql-core';
import {relations} from 'drizzle-orm'

export const users = mysqlTable('users', {
  id: int().primaryKey().autoincrement(),
  fullname: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  role: mysqlEnum("role",["client", "photographer"]).notNull(),
  passwordHash: varchar("password_hash",{length: 255}),
});


export const jobpost = mysqlTable('jobpost',{
  id: int().primaryKey().autoincrement(),
  clientId: int().notNull(),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 1000 }).notNull(),
  location: varchar({ length: 255 }).notNull(),
  category: varchar({ length: 255 }).notNull(), 
  date: date().notNull(),
  duration_hours: int().notNull(),
  status: mysqlEnum("status",["open", "filled", "completed", "cancelled"]).notNull(),
 totalPrice: int().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  
})

export const profiles = mysqlTable("profiles", {
  id: int().primaryKey().autoincrement(),
  userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
  phoneNumber: varchar({ length: 20 }),
  imageUrl: varchar({ length: 500 }),
  bio: varchar({length:400}),
  website: varchar({ length: 255 }),
  location: varchar({ length: 255 }),
  updatedAt: timestamp().defaultNow().onUpdateNow(),
});

export const photographer_profiles = mysqlTable("photographer_profiles", {
  id: int().primaryKey().autoincrement(),
  userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
  phoneNumber: varchar({ length: 20 }),
  bio: varchar({length:400}),
  fullname: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull(),
  role: mysqlEnum("role",["client", "photographer"]).notNull(), 
  location: varchar({ length: 255 }),
  updatedAt: timestamp().defaultNow().onUpdateNow(),
  experience : int().notNull(),
  hourlyRate : int().notNull(),
  specialties : json('specialties').$type<string[]>().default([]),
  availability :boolean().notNull(),
  portfolio_image_url:json('portfolio_image_url').$type<string[]>().default([]),
});



export const portfolio = mysqlTable("portfolio",{
  id: int().primaryKey().autoincrement(),
  photographer_id: int().notNull(),
  title: varchar({length:255}),
  description: varchar({length:255}),
  image_url: varchar({length: 255})
})

export const job_applications = mysqlTable('job_applications',{
  id: int().primaryKey().autoincrement(),
  jobId: int().notNull(),
  photographerId: int().notNull(),
  message: varchar({length: 255}).notNull(),
  bidAmount: int(),
  createdAt: timestamp('created_at').defaultNow().notNull(), 
  status:mysqlEnum("status",["pending", "accepted", "rejected"]).notNull(),
  isRead: boolean().default(false),
})


export const userRelations = relations(users, ({one}) =>({
photographer_profiles: one(photographer_profiles,{
  fields:[users.id],
  references:[photographer_profiles.userId]
}),

profiles: one(profiles, {fields:[users.id], references:[profiles.userId]})
})) 