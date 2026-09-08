import { Language } from "@/stores/languageStore";

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.title": "Kannan Stores",
    "nav.dashboard": "Dashboard",
    "nav.products": "Products",
    "nav.categories": "Categories",
    "nav.staffNav": "Staff",
    "nav.analytics": "Analytics",
    "nav.settings": "Settings",
    "nav.search": "Search",
    "nav.logout": "Logout",
    "nav.owner": "Owner",
    "nav.staffRole": "Staff",

    // Common
    "common.search": "Search",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.add": "Add",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.loading": "Loading",
    "common.noResults": "No results found",
    "common.error": "Error",
    "common.success": "Success",
    "common.back": "Back to results",
    "common.active": "Active",
    "common.inactive": "Inactive",

    // Dashboard
    "dashboard.title": "Admin Dashboard",
    "dashboard.welcome": "Welcome",
    "dashboard.management": "Management",
    "dashboard.totalProducts": "Total Products",
    "dashboard.activeVariants": "Active Variants",
    "dashboard.staffMembers": "Staff Members",
    "dashboard.gettingStarted": "Getting Started",
    "dashboard.setupCategories": "Set Up Categories",
    "dashboard.addProducts": "Add Products",
    "dashboard.managePricing": "Manage Pricing",
    "dashboard.staffAccess": "Staff Access",
    "dashboard.comingSoon": "Coming soon",
"dashboard.includingYou": "Including you",

"dashboard.categoriesDescription":
  "Manage product categories and subcategories",
"dashboard.productsDescription":
  "Manage products and variants",
"dashboard.staffDescription":
  "Manage staff accounts and access",
"dashboard.analyticsDescription":
  "View trends and performance metrics",
"dashboard.settingsDescription":
  "Manage application settings",

"dashboard.setupCategoriesDescription":
  "Start by creating product categories and subcategories to organize your products.",
"dashboard.addProductsDescription":
  "Create products with multiple variants (pack sizes) and prices.",
"dashboard.managePricingDescription":
  "Update prices and view complete price history for audit purposes.",
"dashboard.staffAccessDescription":
  "Add staff members who can search for product prices on mobile.",

    // Products
    "products.title": "Products",
    "products.addProduct": "Add Product",
    "products.editProduct": "Edit Product",
    "products.englishName": "English Name",
    "products.tamilName": "Tamil Name",
    "products.category": "Category",
    "products.subcategory": "Subcategory",
    "products.brand": "Brand",
    "products.sku": "SKU",
    "products.status": "Status",
    "products.image": "Image",
    "products.deleteProduct": "Delete Product",
    "products.deletePermanently": "Delete Permanently",
    "products.deleteWarning":
      "Delete this product permanently? This will permanently remove the product, its variants, and their price history. This action cannot be undone.",
    "products.uploadImage": "Upload Image",
    "products.removeImage": "Remove Image",
    "products.management": "Product Management",
"products.manageDescription": "Manage products and their variants",
"products.addProductButton": "+ Add Product",
"products.filterByCategory": "Filter by Category",
"products.allCategories": "All Categories",
"products.filterByStatus": "Filter by Status",
"products.allProducts": "All Products",
"products.product": "Product",
"products.variants": "Variants",
"products.actions": "Actions",
"products.noProducts": "No products found",
"products.failedToLoad": "Failed to load products",
"products.statusUpdated": "Product status updated",
"products.failedToUpdateStatus": "Failed to update product status",
"products.edit": "Edit",
"products.pricing": "Pricing",
"products.history": "History",
"products.previous": "Previous",
"products.next": "Next",
"products.page": "Page",

    // Pricing
    "pricing.b2bPrice": "B2B Price",
    "pricing.b2cPrice": "B2C Price",
    "pricing.purchaseCost": "Purchase Cost",
    "pricing.updatePrice": "Update Price",
    "pricing.priceHistory": "Price History",
    "pricing.currentPrice": "Current Price",
    "pricing.updated": "Updated",
    "pricing.availableSizes": "Available Sizes",

    // Categories
    "categories.title": "Categories",
    "categories.addCategory": "Add Category",
    "categories.editCategory": "Edit Category",
    "categories.categoryName": "Category Name",
    // Categories
"categories.management": "Category Management",
"categories.manageDescription": "Manage product categories and subcategories",
"categories.addCategoryButton": "+ Add Category",
"categories.categoryCount": "Categories",
"categories.noCategories": "No categories yet",
"categories.subcategoriesCount": "subcategories",
"categories.selectCategory": "Select a category to view details",
"categories.edit": "Edit",
"categories.deactivate": "Deactivate",
"categories.activate": "Activate",
"categories.subcategories": "Subcategories",
"categories.addSubcategory": "+ Add",
"categories.noSubcategories": "No subcategories yet",
"categories.nameRequired": "Category name is required",
"categories.subcategoryNameRequired": "Subcategory name is required",
"categories.selectCategoryFirst": "Please select a category first",
"categories.selectionError": "Selection error",
"categories.categoryCreated": "Category created successfully",
"categories.categoryUpdated": "Category updated successfully",
"categories.categoryStatusUpdated": "Category status updated",
"categories.subcategoryCreated": "Subcategory created successfully",
"categories.subcategoryUpdated": "Subcategory updated successfully",
"categories.subcategoryStatusUpdated": "Subcategory status updated",
"categories.failedToLoad": "Failed to load categories",
"categories.failedToLoadSubcategories": "Failed to load subcategories",
"categories.failedToCreate": "Failed to create category",
"categories.failedToUpdate": "Failed to update category",
"categories.failedToUpdateStatus": "Failed to update category status",
"categories.failedToCreateSubcategory": "Failed to create subcategory",
"categories.failedToUpdateSubcategory": "Failed to update subcategory",
"categories.failedToUpdateSubcategoryStatus":"Failed to update subcategory status",
"categories.editSubcategory": "Edit Subcategory",
"categories.name": "Name",
"categories.description": "Description",
"categories.categoryNamePlaceholder": "Category name",
"categories.subcategoryNamePlaceholder": "Subcategory name",
"categories.descriptionPlaceholder": "Description (optional)",
"categories.update": "Update",
"categories.create": "Create",

    // Subcategories
    "subcategories.title": "Subcategories",
    "subcategories.addSubcategory": "Add Subcategory",
    "subcategories.editSubcategory": "Edit Subcategory",
    "subcategories.subcategoryName": "Subcategory Name",

    // Staff
    "staff.title": "Staff",
    "staff.addStaff": "Add Staff",
    "staff.editStaff": "Edit Staff",
    "staff.staffEmail": "Staff Email",
    "staff.staffPassword": "Password",
    "staff.staffName": "Staff Name",
    "staff.activate": "Activate",
    "staff.deactivate": "Deactivate",
    // Staff
"staff.management": "Staff Management",
"staff.manageDescription": "Manage staff accounts and access",
"staff.addStaffButton": "+ Add Staff",
"staff.loading": "Loading staff...",
"staff.allFieldsRequired": "All fields are required",
"staff.updatedSuccessfully": "Staff member updated successfully",
"staff.addedSuccessfully": "Staff member added successfully",
"staff.failedToLoad": "Failed to load staff members",
"staff.failedToSave": "Failed to save staff member",
"staff.statusUpdated": "Staff status updated",
"staff.failedToUpdateStatus": "Failed to update status",
"staff.name": "Name",
"staff.email": "Email",
"staff.password": "Password",
"staff.leaveBlankToKeepCurrent": "(leave blank to keep current)",
"staff.updateMember": "Update Staff Member",
"staff.addMember": "Add Staff Member",
"staff.role": "Role",
"staff.status": "Status",
"staff.actions": "Actions",
"staff.noMembers": "No staff members added yet",
"staff.edit": "Edit",

    // Staff Search
    "staffSearch.title": "Search Products",
    "staffSearch.placeholder":
      "Search product name, Tamil name, SKU, or brand...",
    "staffSearch.noProducts": "No products found. Try a different search.",
    "staffSearch.getStarted": "Search for a product to get started",
    "staffSearch.voiceComingSoon": "🎤 Voice search coming soon",
    "staffSearch.searchFailed": "Search failed",
"staffSearch.voiceNotSupported": "Voice search is not supported in this browser",
"staffSearch.microphonePermission": "Microphone permission is required",
"staffSearch.noSpeech": "No speech was detected",
"staffSearch.voiceFailed": "Voice search failed",
"staffSearch.notUpdated": "Not updated yet",
"staffSearch.justNow": "Just now",
"staffSearch.oneMinuteAgo": "1 minute ago",
"staffSearch.minutesAgo": "minutes ago",
"staffSearch.oneHourAgo": "1 hour ago",
"staffSearch.hoursAgo": "hours ago",

    // Settings
    "settings.title": "Settings",
    "settings.theme": "Theme",
    "settings.language": "Language",
    "settings.lightMode": "Light Mode",
    "settings.darkMode": "Dark Mode",
    // Settings
"settings.subtitle": "Manage your application preferences",
"settings.preferences": "Preferences",
"settings.application": "Application",
"settings.applicationName": "Application Name",
"settings.version": "Version",
"settings.futureSettings": "More Settings Coming Soon",
"settings.futureSettingsDescription":
  "Additional application settings and configuration options may be added in future versions.",

    // Analytics
    "analytics.title": "Analytics",
    "analytics.subtitle": "Track trends and performance metrics",
    "analytics.comingSoon": "Analytics features coming soon",
    "analytics.futureFeatures": "This will include:",
    "analytics.frequentlySearched": "Frequently searched products",
    "analytics.noResultSearches": "No-result searches",
    "analytics.priceChangeFrequency": "Price change frequency",
    "analytics.pricesTrends": "B2B/B2C price trends",
    "analytics.marginAnalysis": "Margin analysis",
    "analytics.productPerformance": "Product performance",

    // Alerts
    "alerts.confirmDelete": "Are you sure?",
    "alerts.deleteWarning": "This action cannot be undone.",
  },
  ta: {
    // Navigation
    "nav.title": "கண்ணன் ஸ்டோர்ஸ்",
    "nav.dashboard": "டாஷ்போர்டு",
    "nav.products": "பொருட்கள்",
    "nav.categories": "பிரிவுகள்",
    "nav.staffNav": "பணியாளர்",
    "nav.analytics": "பகுப்பாய்வு",
    "nav.settings": "அமைப்புகள்",
    "nav.search": "தேடல்",
    "nav.logout": "வெளியேறு",
    "nav.owner": "உரிமையாளர்",
    "nav.staffRole": "பணியாளர்",

    // Common
    "common.search": "தேடு",
    "common.cancel": "ரத்து செய்",
    "common.save": "சேமிக்கவும்",
    "common.add": "சேர்க்கவும்",
    "common.edit": "திருத்துக",
    "common.delete": "நீக்கு",
    "common.loading": "ஏற்றுதல்",
    "common.noResults": "முடிவுகள் எதுவும் இல்லை",
    "common.error": "பிழை",
    "common.success": "வெற்றி",
    "common.back": "முடிவுகளுக்குத் திரும்பவும்",
    "common.active": "செயலில்",
    "common.inactive": "செயலற்ற",

    // Dashboard
    "dashboard.title": "நிர்வாக டாஷ்போர்டு",
    "dashboard.welcome": "வரவேற்பு",
    "dashboard.management": "நிர்வாகம்",
    "dashboard.totalProducts": "மொத்த பொருட்கள்",
    "dashboard.activeVariants": "சுறுசுறுப்பான வேறுபாடுகள்",
    "dashboard.staffMembers": "பணியாளர் உறுப்பினர்கள்",
    "dashboard.gettingStarted": "தொடங்குதல்",
    "dashboard.setupCategories": "பிரிவுகளை அமைக்கவும்",
    "dashboard.addProducts": "பொருட்களை சேர்க்கவும்",
    "dashboard.managePricing": "விலை நிர்ணயத்தை நிர்வகிக்கவும்",
    "dashboard.staffAccess": "பணியாளர் அணுகல்",
    "dashboard.comingSoon": "விரைவில்",
"dashboard.includingYou": "உங்களையும் சேர்த்து",

"dashboard.categoriesDescription":
  "பொருட்களின் பிரிவுகள் மற்றும் துணைப்பிரிவுகளை நிர்வகிக்கவும்",
"dashboard.productsDescription":
  "பொருட்கள் மற்றும் அவற்றின் வகைகளை நிர்வகிக்கவும்",
"dashboard.staffDescription":
  "பணியாளர் கணக்குகள் மற்றும் அணுகலை நிர்வகிக்கவும்",
"dashboard.analyticsDescription":
  "போக்குகள் மற்றும் செயல்திறன் அளவீடுகளைக் காண்க",
"dashboard.settingsDescription":
  "பயன்பாட்டு அமைப்புகளை நிர்வகிக்கவும்",

"dashboard.setupCategoriesDescription":
  "உங்கள் பொருட்களை ஒழுங்குபடுத்த பிரிவுகள் மற்றும் துணைப்பிரிவுகளை உருவாக்கத் தொடங்குங்கள்.",
"dashboard.addProductsDescription":
  "பல வகைகள், அளவுகள் மற்றும் விலைகளுடன் பொருட்களை உருவாக்குங்கள்.",
"dashboard.managePricingDescription":
  "விலைகளைப் புதுப்பித்து, முழுமையான விலை வரலாற்றைப் பார்க்கவும்.",
"dashboard.staffAccessDescription":
  "மொபைலில் பொருட்களின் விலைகளைத் தேட பணியாளர்களைச் சேர்க்கவும்.",
    // Products
    "products.title": "பொருட்கள்",
    "products.addProduct": "பொருள் சேர்க்கவும்",
    "products.editProduct": "பொருளைத் திருத்துக",
    "products.englishName": "ஆங்கிலப் பெயர்",
    "products.tamilName": "தமிழ்ப் பெயர்",
    "products.category": "பிரிவு",
    "products.subcategory": "துணைக்குழு",
    "products.brand": "பிராண்ட்",
    "products.sku": "SKU",
    "products.status": "நிலை",
    "products.image": "படம்",
    "products.deleteProduct": "பொருளை நீக்கு",
    "products.deletePermanently": "என்றென்றும் நீக்கு",
    "products.deleteWarning":
      "இந்தப் பொருளை என்றென்றும் நீக்க விரும்புகிறீர்களா? இது பொருள், அதன் வெவ்வேறுகள் மற்றும் அவற்றின் விலை வரலாற்றை நீக்கும். இந்த நடவடிக்கையை செயல்தீர செய்ய முடியாது.",
    "products.uploadImage": "படத்தை பதிவேற்று",
    "products.removeImage": "படத்தை அகற்று",
    "products.management": "பொருள் நிர்வாகம்",
"products.manageDescription": "பொருட்கள் மற்றும் அவற்றின் வகைகளை நிர்வகிக்கவும்",
"products.addProductButton": "+ பொருளைச் சேர்க்கவும்",
"products.filterByCategory": "பிரிவின்படி வடிகட்டவும்",
"products.allCategories": "அனைத்து பிரிவுகளும்",
"products.filterByStatus": "நிலையின்படி வடிகட்டவும்",
"products.allProducts": "அனைத்து பொருட்களும்",
"products.product": "பொருள்",
"products.variants": "வகைகள்",
"products.actions": "செயல்கள்",
"products.noProducts": "பொருட்கள் எதுவும் கிடைக்கவில்லை",
"products.failedToLoad": "பொருட்களை ஏற்ற முடியவில்லை",
"products.statusUpdated": "பொருளின் நிலை புதுப்பிக்கப்பட்டது",
"products.failedToUpdateStatus": "பொருளின் நிலையைப் புதுப்பிக்க முடியவில்லை",
"products.edit": "திருத்துக",
"products.pricing": "விலை",
"products.history": "வரலாறு",
"products.previous": "முந்தையது",
"products.next": "அடுத்தது",
"products.page": "பக்கம்",

    // Pricing
    "pricing.b2bPrice": "B2B விலை",
    "pricing.b2cPrice": "B2C விலை",
    "pricing.purchaseCost": "கொள்முதல் செலவு",
    "pricing.updatePrice": "விலையைப் புதுப்பிக்கவும்",
    "pricing.priceHistory": "விலை வரலாறு",
    "pricing.currentPrice": "தற்போதைய விலை",
    "pricing.updated": "புதுப்பிக்கப்பட்டது",
    "pricing.availableSizes": "கிடைக்கக்கூடிய அளவுகள்",

    // Categories
    "categories.title": "பிரிவுகள்",
    "categories.addCategory": "பிரிவைச் சேர்க்கவும்",
    "categories.editCategory": "பிரிவைத் திருத்துக",
    "categories.categoryName": "பிரிவுப் பெயர்",
    // Categories
"categories.management": "பிரிவு நிர்வாகம்",
"categories.manageDescription": "பொருட்களின் பிரிவுகள் மற்றும் துணைப்பிரிவுகளை நிர்வகிக்கவும்",
"categories.addCategoryButton": "+ பிரிவைச் சேர்க்கவும்",
"categories.categoryCount": "பிரிவுகள்",
"categories.noCategories": "பிரிவுகள் எதுவும் இல்லை",
"categories.subcategoriesCount": "துணைப்பிரிவுகள்",
"categories.selectCategory": "விவரங்களைக் காண ஒரு பிரிவைத் தேர்ந்தெடுக்கவும்",
"categories.edit": "திருத்துக",
"categories.deactivate": "செயலிழக்கச் செய்",
"categories.activate": "செயல்படுத்து",
"categories.subcategories": "துணைப்பிரிவுகள்",
"categories.addSubcategory": "+ சேர்",
"categories.noSubcategories": "துணைப்பிரிவுகள் எதுவும் இல்லை",
"categories.nameRequired": "பிரிவின் பெயர் அவசியம்",
"categories.subcategoryNameRequired": "துணைப்பிரிவின் பெயர் அவசியம்",
"categories.selectCategoryFirst": "முதலில் ஒரு பிரிவைத் தேர்ந்தெடுக்கவும்",
"categories.selectionError": "தேர்வு பிழை",
"categories.categoryCreated": "பிரிவு வெற்றிகரமாக உருவாக்கப்பட்டது",
"categories.categoryUpdated": "பிரிவு வெற்றிகரமாக புதுப்பிக்கப்பட்டது",
"categories.categoryStatusUpdated": "பிரிவின் நிலை புதுப்பிக்கப்பட்டது",
"categories.subcategoryCreated": "துணைப்பிரிவு வெற்றிகரமாக உருவாக்கப்பட்டது",
"categories.subcategoryUpdated": "துணைப்பிரிவு வெற்றிகரமாக புதுப்பிக்கப்பட்டது",
"categories.subcategoryStatusUpdated": "துணைப்பிரிவின் நிலை புதுப்பிக்கப்பட்டது",
"categories.failedToLoad": "பிரிவுகளை ஏற்ற முடியவில்லை",
"categories.failedToLoadSubcategories":
  "துணைப்பிரிவுகளை ஏற்ற முடியவில்லை",
"categories.failedToCreate": "பிரிவை உருவாக்க முடியவில்லை",
"categories.failedToUpdate": "பிரிவை புதுப்பிக்க முடியவில்லை",
"categories.failedToUpdateStatus": "பிரிவின் நிலையை புதுப்பிக்க முடியவில்லை",
"categories.failedToCreateSubcategory": "துணைப்பிரிவை உருவாக்க முடியவில்லை",
"categories.failedToUpdateSubcategory":
  "துணைப்பிரிவை புதுப்பிக்க முடியவில்லை",
"categories.failedToUpdateSubcategoryStatus":
  "துணைப்பிரிவின் நிலையை புதுப்பிக்க முடியவில்லை",
"categories.editSubcategory": "துணைப்பிரிவைத் திருத்துக",
"categories.name": "பெயர்",
"categories.description": "விளக்கம்",
"categories.categoryNamePlaceholder": "பிரிவின் பெயர்",
"categories.subcategoryNamePlaceholder": "துணைப்பிரிவின் பெயர்",
"categories.descriptionPlaceholder": "விளக்கம் (விருப்பம்)",
"categories.update": "புதுப்பிக்கவும்",
"categories.create": "உருவாக்கவும்",

    // Subcategories
    "subcategories.title": "துணைப்பிரிவுகள்",
    "subcategories.addSubcategory": "துணைப்பிரிவைச் சேர்க்கவும்",
    "subcategories.editSubcategory": "துணைப்பிரிவைத் திருத்துக",
    "subcategories.subcategoryName": "துணைப்பிரிவுப் பெயர்",

    // Staff
    "staff.title": "பணியாளர்",
    "staff.addStaff": "பணியாளரைச் சேர்க்கவும்",
    "staff.editStaff": "பணியாளரைத் திருத்துக",
    "staff.staffEmail": "பணியாளர் மின்னஞ்சல்",
    "staff.staffPassword": "கடவுச்சொல்",
    "staff.staffName": "பணியாளர் பெயர்",
    "staff.activate": "செயல்படுத்து",
    "staff.deactivate": "செயல்நீக்கு",
    // Staff
"staff.management": "பணியாளர் நிர்வாகம்",
"staff.manageDescription": "பணியாளர் கணக்குகள் மற்றும் அணுகலை நிர்வகிக்கவும்",
"staff.addStaffButton": "+ பணியாளரைச் சேர்க்கவும்",
"staff.loading": "பணியாளர்களை ஏற்றுகிறது...",
"staff.allFieldsRequired": "அனைத்து புலங்களும் அவசியம்",
"staff.updatedSuccessfully": "பணியாளர் வெற்றிகரமாக புதுப்பிக்கப்பட்டார்",
"staff.addedSuccessfully": "பணியாளர் வெற்றிகரமாக சேர்க்கப்பட்டார்",
"staff.failedToLoad": "பணியாளர்களை ஏற்ற முடியவில்லை",
"staff.failedToSave": "பணியாளரைச் சேமிக்க முடியவில்லை",
"staff.statusUpdated": "பணியாளர் நிலை புதுப்பிக்கப்பட்டது",
"staff.failedToUpdateStatus": "நிலையைப் புதுப்பிக்க முடியவில்லை",
"staff.name": "பெயர்",
"staff.email": "மின்னஞ்சல்",
"staff.password": "கடவுச்சொல்",
"staff.leaveBlankToKeepCurrent": "(தற்போதைய கடவுச்சொல்லை வைத்திருக்க காலியாக விடவும்)",
"staff.updateMember": "பணியாளரைப் புதுப்பிக்கவும்",
"staff.addMember": "பணியாளரைச் சேர்க்கவும்",
"staff.role": "பங்கு",
"staff.status": "நிலை",
"staff.actions": "செயல்கள்",
"staff.noMembers": "பணியாளர்கள் யாரும் இன்னும் சேர்க்கப்படவில்லை",
"staff.edit": "திருத்துக",

    // Staff Search
    "staffSearch.title": "பொருட்களைத் தேடுக",
    "staffSearch.placeholder":
      "பொருளின் பெயர், தமிழ்ப் பெயர், SKU அல்லது பிராண்டைத் தேடுக...",
    "staffSearch.noProducts":
      "பொருட்கள் எதுவும் கிடைக்கவில்லை.",
    "staffSearch.getStarted": "தொடங்குவதற்கு ஒரு பொருளைத் தேடுக",
    "staffSearch.voiceComingSoon": "🎤 குரல் தேடல் விரைவில் வரும்",
    "staffSearch.searchFailed": "தேடல் தோல்வியடைந்தது",
"staffSearch.voiceNotSupported":
  "இந்த உலாவியில் குரல் தேடல் ஆதரிக்கப்படவில்லை",
"staffSearch.microphonePermission":
  "மைக்ரோஃபோன் அனுமதி தேவை",
"staffSearch.noSpeech":
  "குரல் எதுவும் கண்டறியப்படவில்லை",
"staffSearch.voiceFailed":
  "குரல் தேடல் தோல்வியடைந்தது",
"staffSearch.notUpdated":
  "இன்னும் புதுப்பிக்கப்படவில்லை",
"staffSearch.justNow":
  "இப்போதுதான்",
"staffSearch.oneMinuteAgo":
  "1 நிமிடத்திற்கு முன்",
"staffSearch.minutesAgo":
  "நிமிடங்களுக்கு முன்",
"staffSearch.oneHourAgo":
  "1 மணி நேரத்திற்கு முன்",
"staffSearch.hoursAgo":
  "மணி நேரங்களுக்கு முன்",

    // Settings
    "settings.title": "அமைப்புகள்",
    "settings.theme": "தீம்",
    "settings.language": "மொழி",
    "settings.lightMode": "ஒளி பயன்முறை",
    "settings.darkMode": "இருள் பயன்முறை",
    // Settings
"settings.subtitle": "பயன்பாட்டின் விருப்பங்களை நிர்வகிக்கவும்",
"settings.preferences": "விருப்பங்கள்",

"settings.application": "பயன்பாடு",
"settings.applicationName": "பயன்பாட்டின் பெயர்",
"settings.version": "பதிப்பு",
"settings.futureSettings": "மேலும் அமைப்புகள் விரைவில்",
"settings.futureSettingsDescription":
  "கூடுதல் பயன்பாட்டு அமைப்புகள் மற்றும் உள்ளமைவு விருப்பங்கள் எதிர்கால பதிப்புகளில் சேர்க்கப்படலாம்.",

    // Analytics
    "analytics.title": "பகுப்பாய்வு",
    "analytics.subtitle": "போக்குகள் மற்றும் செயல்திறன் அளவீடுகளை கண்காணிக்கவும்",
    "analytics.comingSoon": "பகுப்பாய்வு அம்சங்கள் விரைவில் வரும்",
    "analytics.futureFeatures": "இது பின்வருவனவற்றை உள்ளடக்கும்:",
    "analytics.frequentlySearched": "அடிக்கடி தேடப்பட்ட பொருட்கள்",
    "analytics.noResultSearches": "முடிவு இல்லாத தேடல்கள்",
    "analytics.priceChangeFrequency": "விலை மாற்றத்தின் அதிர்வெண்",
    "analytics.pricesTrends": "B2B/B2C விலை போக்குகள்",
    "analytics.marginAnalysis": "விளிம்பு பகுப்பாய்வு",
    "analytics.productPerformance": "பொருள் செயல்திறன்",

    // Alerts
    "alerts.confirmDelete": "நிச்சயமாக?",
    "alerts.deleteWarning": "இந்த நடவடிக்கையை செயல்தீர செய்ய முடியாது.",
  },
};

export const t = (key: string, language: Language): string => {
  return translations[language]?.[key] || key;
};
