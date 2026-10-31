import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_pages_blocks_call_to_action_style" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum_pages_blocks_feature_grid_features_icon_name" AS ENUM('AArrowDown', 'AArrowUp', 'ALargeSmall', 'Accessibility', 'Activity', 'Ad', 'AirVent', 'Airplay', 'AlarmClock', 'AlarmClockCheck', 'AlarmClockMinus', 'AlarmClockOff', 'AlarmClockPlus', 'AlarmSmoke', 'AlignCenterHorizontal', 'AlignCenterVertical', 'AlignEndHorizontal', 'AlignEndVertical', 'AlignHorizontalDistributeCenter', 'AlignHorizontalDistributeEnd', 'AlignHorizontalDistributeStart', 'AlignHorizontalJustifyCenter', 'AlignHorizontalJustifyEnd', 'AlignHorizontalJustifyStart', 'AlignHorizontalSpaceAround', 'AlignHorizontalSpaceBetween', 'AlignStartHorizontal', 'AlignStartVertical', 'AlignVerticalDistributeCenter', 'AlignVerticalDistributeEnd', 'AlignVerticalDistributeStart', 'AlignVerticalJustifyCenter', 'AlignVerticalJustifyEnd', 'AlignVerticalJustifyStart', 'AlignVerticalSpaceAround', 'AlignVerticalSpaceBetween', 'Ambulance', 'Ampersand', 'Ampersands', 'Amphora', 'Anchor', 'Angle', 'Antenna', 'Anvil', 'Aperture', 'AppWindow', 'AppWindowMac', 'Apple', 'Archive', 'ArchiveArrowDown', 'ArchiveArrowUp', 'ArchiveX', 'Armchair', 'ArmenianDram', 'ArrowBigDown', 'ArrowBigDownDash', 'ArrowBigLeft', 'ArrowBigLeftDash', 'ArrowBigRight', 'ArrowBigRightDash', 'ArrowBigUp', 'ArrowBigUpDash', 'ArrowDown', 'ArrowDown01', 'ArrowDown10', 'ArrowDownAZ', 'ArrowDownFromLine', 'ArrowDownLeft', 'ArrowDownNarrowWide', 'ArrowDownRight', 'ArrowDownToDot', 'ArrowDownToLine', 'ArrowDownUp', 'ArrowDownWideNarrow', 'ArrowDownZA', 'ArrowLeft', 'ArrowLeftFromLine', 'ArrowLeftRight', 'ArrowLeftToLine', 'ArrowRight', 'ArrowRightFromLine', 'ArrowRightLeft', 'ArrowRightToLine', 'ArrowUp', 'ArrowUp01', 'ArrowUp10', 'ArrowUpAZ', 'ArrowUpDown', 'ArrowUpFromDot', 'ArrowUpFromLine', 'ArrowUpLeft', 'ArrowUpNarrowWide', 'ArrowUpRight', 'ArrowUpToLine', 'ArrowUpWideNarrow', 'ArrowUpZA', 'ArrowsUpFromLine', 'Asterisk', 'Astroid', 'AtSign', 'Atom', 'AudioLines', 'AudioLinesOff', 'AudioLinesX', 'AudioWaveform', 'Avocado', 'Award', 'Axe', 'Axis3d', 'AzerbaijaniManat', 'Baby', 'Backpack', 'Bacon', 'Badge', 'BadgeAlert', 'BadgeCent', 'BadgeCheck', 'BadgeDollarSign', 'BadgeEuro', 'BadgeIndianRupee', 'BadgeInfo', 'BadgeJapaneseYen', 'BadgeMinus', 'BadgePercent', 'BadgePlus', 'BadgePoundSterling', 'BadgeQuestionMark', 'BadgeRussianRuble', 'BadgeSwissFranc', 'BadgeTurkishLira', 'BadgeX', 'BaggageClaim', 'BallWave', 'Balloon', 'Ban', 'Banana', 'Bandage', 'BangladeshiTaka', 'Banknote', 'BanknoteArrowDown', 'BanknoteArrowUp', 'BanknoteCheck', 'BanknoteX', 'Barcode', 'Barrel', 'Baseline', 'Bath', 'Battery', 'BatteryCharging', 'BatteryFull', 'BatteryLow', 'BatteryMedium', 'BatteryPlus', 'BatteryWarning', 'Beaker', 'Bean', 'BeanOff', 'Bed', 'BedDouble', 'BedSingle', 'Beef', 'BeefOff', 'Beer', 'BeerOff', 'BelarusianRuble', 'Bell', 'BellCheck', 'BellDot', 'BellElectric', 'BellMinus', 'BellOff', 'BellPlus', 'BellRing', 'BetweenHorizontalEnd', 'BetweenHorizontalStart', 'BetweenVerticalEnd', 'BetweenVerticalStart', 'BicepsFlexed', 'Bike', 'Binary', 'Binoculars', 'Biohazard', 'Bird', 'Birdhouse', 'Bitcoin', 'Blend', 'Blender', 'Blinds', 'Blocks', 'Bluetooth', 'BluetoothConnected', 'BluetoothOff', 'BluetoothSearching', 'Bolt', 'Bomb', 'Bone', 'BoneFracture', 'Book', 'BookA', 'BookAlert', 'BookAudio', 'BookBookmark', 'BookCheck', 'BookCopy', 'BookDashed', 'BookDown', 'BookHeadphones', 'BookHeart', 'BookImage', 'BookKey', 'BookLock', 'BookMinus', 'BookOpen', 'BookOpenCheck', 'BookOpenText', 'BookPlus', 'BookSearch', 'BookText', 'BookType', 'BookUp', 'BookUp2', 'BookUser', 'BookX', 'Bookmark', 'BookmarkCheck', 'BookmarkMinus', 'BookmarkOff', 'BookmarkPlus', 'BookmarkX', 'BoomBox', 'Bot', 'BotMessageSquare', 'BotOff', 'BottleWine', 'BowArrow', 'Box', 'Boxes', 'BoxesLinked', 'Braces', 'Brackets', 'Brain', 'BrainCircuit', 'BrainCog', 'BrainOff', 'BrickWall', 'BrickWallFire', 'BrickWallShield', 'Bridge', 'Briefcase', 'BriefcaseBusiness', 'BriefcaseConveyorBelt', 'BriefcaseMedical', 'BriefcasePlus', 'BringToFront', 'Broccoli', 'Broom', 'BroomSparkles', 'Brush', 'BrushCleaning', 'Bubbles', 'Bug', 'BugOff', 'BugPlay', 'Building', 'BuildingComplex', 'BuildingComplexPlus', 'Bus', 'BusFront', 'Cable', 'CableCar', 'Cake', 'CakeSlice', 'Calculator', 'Calendar', 'Calendar1', 'CalendarArrowDown', 'CalendarArrowLeft', 'CalendarArrowRight', 'CalendarArrowUp', 'CalendarCheck', 'CalendarCheck2', 'CalendarChevronsLeft', 'CalendarChevronsRight', 'CalendarClock', 'CalendarCog', 'CalendarDays', 'CalendarFold', 'CalendarHeart', 'CalendarMinus', 'CalendarMinus2', 'CalendarOff', 'CalendarPlus', 'CalendarPlus2', 'CalendarRange', 'CalendarSearch', 'CalendarSync', 'CalendarX', 'CalendarX2', 'Calendars', 'Camera', 'CameraOff', 'Can', 'CanSoda', 'Candy', 'CandyCane', 'CandyOff', 'Cannabis', 'CannabisOff', 'Captions', 'CaptionsOff', 'Car', 'CarBattery', 'CarFront', 'CarTaxiFront', 'Caravan', 'CardSim', 'Carrot', 'Carton', 'CartonOff', 'CaseLower', 'CaseSensitive', 'CaseUpper', 'CassetteTape', 'Cast', 'Castle', 'Cat', 'Cctv', 'CctvOff', 'Certificate', 'ChartArea', 'ChartBar', 'ChartBarBig', 'ChartBarDecreasing', 'ChartBarIncreasing', 'ChartBarStacked', 'ChartBellCurve', 'ChartCandlestick', 'ChartColumn', 'ChartColumnBig', 'ChartColumnDecreasing', 'ChartColumnIncreasing', 'ChartColumnStacked', 'ChartGantt', 'ChartLine', 'ChartNetwork', 'ChartNoAxesColumn', 'ChartNoAxesColumnDecreasing', 'ChartNoAxesColumnIncreasing', 'ChartNoAxesCombined', 'ChartNoAxesGantt', 'ChartPie', 'ChartQuadrant', 'ChartRadar', 'ChartScatter', 'ChartSpline', 'Check', 'CheckCheck', 'CheckLine', 'ChefHat', 'Cherry', 'ChessBishop', 'ChessKing', 'ChessKnight', 'ChessPawn', 'ChessQueen', 'ChessRook', 'ChevronDown', 'ChevronFirst', 'ChevronLast', 'ChevronLeft', 'ChevronRight', 'ChevronUp', 'ChevronsDown', 'ChevronsDownUp', 'ChevronsLeft', 'ChevronsLeftRight', 'ChevronsLeftRightEllipsis', 'ChevronsRight', 'ChevronsRightLeft', 'ChevronsUp', 'ChevronsUpDown', 'Church', 'Cigarette', 'CigaretteOff', 'Circle', 'CircleAlert', 'CircleArrowDown', 'CircleArrowLeft', 'CircleArrowOutDownLeft', 'CircleArrowOutDownRight', 'CircleArrowOutUpLeft', 'CircleArrowOutUpRight', 'CircleArrowRight', 'CircleArrowUp', 'CircleCheck', 'CircleCheckBig', 'CircleChevronDown', 'CircleChevronLeft', 'CircleChevronRight', 'CircleChevronUp', 'CircleChevronsDown', 'CircleChevronsLeft', 'CircleChevronsRight', 'CircleChevronsUp', 'CircleDashed', 'CircleDashedCheck', 'CircleDivide', 'CircleDollarSign', 'CircleDot', 'CircleDotDashed', 'CircleEllipsis', 'CircleEqual', 'CircleEuro', 'CircleFadingArrowUp', 'CircleFadingPlay', 'CircleFadingPlus', 'CircleGauge', 'CircleLetterA', 'CircleLetterB', 'CircleLetterC', 'CircleLetterD', 'CircleLetterE', 'CircleLetterF', 'CircleLetterG', 'CircleLetterH', 'CircleLetterI', 'CircleLetterJ', 'CircleLetterK', 'CircleLetterL', 'CircleLetterM', 'CircleLetterN', 'CircleLetterO', 'CircleLetterP', 'CircleLetterPOff', 'CircleLetterQ', 'CircleLetterR', 'CircleLetterS', 'CircleLetterT', 'CircleLetterU', 'CircleLetterV', 'CircleLetterW', 'CircleLetterX', 'CircleLetterY', 'CircleLetterZ', 'CircleMinus', 'CircleOff', 'CirclePause', 'CirclePercent', 'CirclePile', 'CirclePlay', 'CirclePlus', 'CirclePoundSterling', 'CirclePower', 'CircleQuestionMark', 'CircleSlash', 'CircleSlash2', 'CircleSmall', 'CircleStar', 'CircleStop', 'CircleUser', 'CircleUserRound', 'CircleX', 'CircuitBoard', 'Citrus', 'Clapperboard', 'ClefAlto', 'ClefBass', 'ClefTreble', 'Clipboard', 'ClipboardCheck', 'ClipboardClock', 'ClipboardCopy', 'ClipboardList', 'ClipboardMinus', 'ClipboardPaste', 'ClipboardPen', 'ClipboardPenLine', 'ClipboardPlus', 'ClipboardType', 'ClipboardX', 'Clock', 'Clock1', 'Clock10', 'Clock11', 'Clock12', 'Clock2', 'Clock3', 'Clock4', 'Clock5', 'Clock6', 'Clock7', 'Clock8', 'Clock9', 'ClockAlert', 'ClockArrowDown', 'ClockArrowLeft', 'ClockArrowRight', 'ClockArrowUp', 'ClockCheck', 'ClockFading', 'ClockPlus', 'ClosedCaption', 'Cloud', 'CloudAlert', 'CloudBackup', 'CloudCheck', 'CloudCog', 'CloudDownload', 'CloudDrizzle', 'CloudFog', 'CloudHail', 'CloudLightning', 'CloudMoon', 'CloudMoonRain', 'CloudOff', 'CloudRain', 'CloudRainWind', 'CloudSnow', 'CloudSun', 'CloudSunRain', 'CloudSync', 'CloudUpload', 'Cloudy', 'Clover', 'Club', 'Code', 'CodeXml', 'Coffee', 'Cog', 'Coins', 'Columns2', 'Columns3', 'Columns3Cog', 'Columns4', 'Combine', 'Command', 'Compass', 'Component', 'Computer', 'ConciergeBell', 'Cone', 'Construction', 'Contact', 'ContactRound', 'Container', 'Contrast', 'Cookie', 'CookingPot', 'Copy', 'CopyCheck', 'CopyMinus', 'CopyPlus', 'CopySlash', 'CopyX', 'Copyleft', 'CornerDownLeft', 'CornerDownRight', 'CornerLeftDown', 'CornerLeftUp', 'CornerRightDown', 'CornerRightUp', 'CornerUpLeft', 'CornerUpRight', 'Cpu', 'CpuAi', 'CreativeCommons', 'CreditCard', 'CreditCardCheck', 'CreditCardMinus', 'CreditCardPlus', 'CreditCardReader', 'CreditCardX', 'Croissant', 'Crop', 'Cross', 'Crosshair', 'Crown', 'Cuboid', 'CupSoda', 'Cupcake', 'Currency', 'Cylinder', 'Dam', 'Database', 'DatabaseArrowDown', 'DatabaseArrowUp', 'DatabaseBackup', 'DatabaseCheck', 'DatabaseCog', 'DatabaseMinus', 'DatabasePlus', 'DatabaseSearch', 'DatabaseX', 'DatabaseZap', 'DecimalsArrowLeft', 'DecimalsArrowRight', 'Delete', 'Dessert', 'Diameter', 'Diamond', 'DiamondMinus', 'DiamondPercent', 'DiamondPlus', 'Dice1', 'Dice2', 'Dice3', 'Dice4', 'Dice5', 'Dice6', 'Dices', 'Diff', 'Disc', 'Disc2', 'Disc3', 'DiscAlbum', 'Divide', 'Dna', 'DnaOff', 'Dock', 'Dog', 'DollarSign', 'Dome', 'Donut', 'DoorClosed', 'DoorClosedCog', 'DoorClosedLocked', 'DoorClosedPackage', 'DoorOpen', 'DoorStairwell', 'Dot', 'Download', 'DraftingCompass', 'Drama', 'Drill', 'Drone', 'Droplet', 'DropletOff', 'Droplets', 'Drum', 'Drumstick', 'Dumbbell', 'Ear', 'EarOff', 'Earbuds', 'EarbudsOff', 'Earth', 'EarthLock', 'Eclipse', 'Egg', 'EggFried', 'EggOff', 'EighthNote', 'EighthNotes', 'Eject', 'Ellipse', 'Ellipsis', 'EllipsisVertical', 'EmiratiDirham', 'Engine', 'Equal', 'EqualApproximately', 'EqualApproximatelyNot', 'EqualNot', 'Eraser', 'EthernetPort', 'Euro', 'EvCharger', 'Expand', 'ExternalLink', 'Eye', 'EyeClosed', 'EyeDashed', 'EyeOff', 'FaceAngry', 'FaceExpressionless', 'FaceGrinning', 'FaceNeutral', 'FaceSlightlyFrowning', 'FaceSlightlySmiling', 'FaceSlightlySmilingPlus', 'Factory', 'Fan', 'FastForward', 'Faucet', 'Feather', 'Fence', 'FerrisWheel', 'File', 'FileArchive', 'FileAxis3d', 'FileBadge', 'FileBox', 'FileBraces', 'FileBracesCorner', 'FileChartColumn', 'FileChartColumnIncreasing', 'FileChartLine', 'FileChartPie', 'FileCheck', 'FileCheckCorner', 'FileClock', 'FileCode', 'FileCodeCorner', 'FileCog', 'FileDatabase', 'FileDiff', 'FileDigit', 'FileDown', 'FileExclamationPoint', 'FileHeadphone', 'FileHeart', 'FileImage', 'FileInput', 'FileKey', 'FileLock', 'FileMinus', 'FileMinusCorner', 'FileMusic', 'FileOutput', 'FilePen', 'FilePenLine', 'FilePlay', 'FilePlus', 'FilePlusCorner', 'FileQuestionMark', 'FileScan', 'FileSearch', 'FileSearchCorner', 'FileSignal', 'FileSliders', 'FileSpreadsheet', 'FileStack', 'FileSymlink', 'FileTerminal', 'FileText', 'FileType', 'FileTypeCorner', 'FileUp', 'FileUser', 'FileVideoCamera', 'FileVolume', 'FileX', 'FileXCorner', 'Files', 'Film', 'FingerprintPattern', 'FireExtinguisher', 'Fish', 'FishOff', 'FishSymbol', 'FishingHook', 'FishingRod', 'Flag', 'FlagOff', 'FlagTriangleLeft', 'FlagTriangleRight', 'Flame', 'FlameKindling', 'Flashlight', 'FlashlightOff', 'FlaskConical', 'FlaskConicalOff', 'FlaskRound', 'Flower', 'Flower2', 'Focus', 'FoldHorizontal', 'FoldVertical', 'Folder', 'FolderArchive', 'FolderBookmark', 'FolderCheck', 'FolderClock', 'FolderClosed', 'FolderCode', 'FolderCog', 'FolderDot', 'FolderDown', 'FolderGit', 'FolderGit2', 'FolderHeart', 'FolderInput', 'FolderKanban', 'FolderKey', 'FolderLock', 'FolderMinus', 'FolderOpen', 'FolderOpenDot', 'FolderOutput', 'FolderPen', 'FolderPlus', 'FolderRoot', 'FolderSearch', 'FolderSearch2', 'FolderSymlink', 'FolderSync', 'FolderTree', 'FolderUp', 'FolderUser', 'FolderUsers', 'FolderX', 'Folders', 'Footprints', 'Forklift', 'Form', 'Forward', 'Frame', 'Fuel', 'Fullscreen', 'Funnel', 'FunnelPlus', 'FunnelX', 'Galaxy', 'GalleryHorizontal', 'GalleryHorizontalEnd', 'GalleryThumbnails', 'GalleryVertical', 'GalleryVerticalEnd', 'Gamepad', 'Gamepad2', 'GamepadDirectional', 'GapHorizontal', 'GapVertical', 'Gauge', 'Gavel', 'Gem', 'GeorgianLari', 'Germ', 'GermOff', 'Ghost', 'Gift', 'GitBranch', 'GitBranchMinus', 'GitBranchPlus', 'GitCommitHorizontal', 'GitCommitVertical', 'GitCompare', 'GitCompareArrows', 'GitFork', 'GitGraph', 'GitMerge', 'GitMergeConflict', 'GitPullRequest', 'GitPullRequestArrow', 'GitPullRequestClosed', 'GitPullRequestCreate', 'GitPullRequestCreateArrow', 'GitPullRequestDraft', 'GlassWater', 'Glasses', 'Globe', 'GlobeCheck', 'GlobeCode', 'GlobeLock', 'GlobeOff', 'GlobeX', 'Goal', 'Gpu', 'GraduationCap', 'Grape', 'GraphHub', 'GraphStar', 'Grid2x2', 'Grid2x2Check', 'Grid2x2Plus', 'Grid2x2X', 'Grid3x2', 'Grid3x3', 'Grip', 'GripHorizontal', 'GripVertical', 'Groceries', 'Group', 'Guitar', 'GuitarElectric', 'HalfNote', 'Ham', 'Hamburger', 'Hammer', 'Hand', 'HandCoins', 'HandFist', 'HandGrab', 'HandHeart', 'HandHelping', 'HandMetal', 'HandPlatter', 'Handbag', 'HandleBottomRight', 'Handshake', 'HardDrive', 'HardDriveDownload', 'HardDriveUpload', 'HardHat', 'Hash', 'HatGlasses', 'Haze', 'Hd', 'HdmiPort', 'Heading1', 'Heading2', 'Heading3', 'Heading4', 'Heading5', 'Heading6', 'HeadphoneOff', 'Headphones', 'Headset', 'Heart', 'HeartCrack', 'HeartHandshake', 'HeartMinus', 'HeartOff', 'HeartPlus', 'HeartPulse', 'HeartX', 'Heater', 'Helicopter', 'Hexagon', 'Highlighter', 'HikingStick', 'HockeyStick', 'Hop', 'HopOff', 'Hospital', 'HotAirBalloon', 'Hotel', 'Hourglass', 'HourglassCog', 'House', 'HouseCog', 'HouseHeart', 'HousePlug', 'HousePlus', 'HouseWifi', 'Houses', 'IceCreamBowl', 'IceCreamCone', 'IdCard', 'IdCardLanyard', 'Image', 'ImageDown', 'ImageMinus', 'ImageOff', 'ImagePlay', 'ImagePlus', 'ImageUp', 'ImageUpscale', 'Images', 'Import', 'Inbox', 'IndianRupee', 'Infinity', 'Info', 'InspectionPanel', 'Italic', 'IterationCcw', 'IterationCw', 'IvBag', 'JapaneseYen', 'Joystick', 'Kanban', 'Kayak', 'KazakhTenge', 'Key', 'KeyRound', 'KeySquare', 'Keyboard', 'KeyboardMusic', 'KeyboardOff', 'Lambda', 'Lamp', 'LampCeiling', 'LampDesk', 'LampFloor', 'LampWallDown', 'LampWallUp', 'LandPlot', 'Landmark', 'Languages', 'Laptop', 'LaptopMinimal', 'LaptopMinimalCheck', 'Laser', 'Lasso', 'LassoSelect', 'LayerArrowDown', 'LayerArrowUp', 'Layers', 'Layers2', 'LayersArrowDown', 'LayersArrowUp', 'LayersMinus', 'LayersPlus', 'LayoutArrowDown', 'LayoutArrowRight', 'LayoutDashboard', 'LayoutFreeform', 'LayoutGrid', 'LayoutGridCircles', 'LayoutList', 'LayoutPanelLeft', 'LayoutPanelTop', 'LayoutTemplate', 'Leaf', 'LeafyGreen', 'Lectern', 'Lens', 'LensConcave', 'LensConvex', 'LetterA', 'LetterB', 'LetterC', 'LetterD', 'LetterE', 'LetterF', 'LetterG', 'LetterH', 'LetterI', 'LetterJ', 'LetterK', 'LetterL', 'LetterM', 'LetterN', 'LetterO', 'LetterP', 'LetterQ', 'LetterR', 'LetterS', 'LetterSpacing', 'LetterT', 'LetterU', 'LetterV', 'LetterW', 'LetterX', 'LetterY', 'LetterZ', 'Letters', 'Library', 'LibraryBig', 'LifeBuoy', 'Ligature', 'Lightbulb', 'LightbulbOff', 'Lighthouse', 'LineDotBottomVertical', 'LineDotLeftHorizontal', 'LineDotRightHorizontal', 'LineDotTopVertical', 'LineHeight', 'LineSquiggle', 'LineStyle', 'Link', 'Link2', 'Link2Off', 'List', 'ListCheck', 'ListChecks', 'ListChevronsDownUp', 'ListChevronsUpDown', 'ListClock', 'ListCollapse', 'ListEnd', 'ListFilter', 'ListFilterPlus', 'ListIndentDecrease', 'ListIndentIncrease', 'ListMinus', 'ListMusic', 'ListOrdered', 'ListPlus', 'ListRestart', 'ListSortAscending', 'ListSortDescending', 'ListStart', 'ListTodo', 'ListTree', 'ListVideo', 'ListX', 'Loader', 'LoaderCircle', 'LoaderPinwheel', 'Locate', 'LocateFixed', 'LocateOff', 'Lock', 'LockKeyhole', 'LockKeyholeOpen', 'LockOpen', 'LogIn', 'LogOut', 'Logs', 'Lollipop', 'Luggage', 'Magnet', 'Mail', 'MailBadge', 'MailCheck', 'MailClock', 'MailDot', 'MailMinus', 'MailOpen', 'MailPen', 'MailPlus', 'MailQuestionMark', 'MailSearch', 'MailWarning', 'MailX', 'Mailbox', 'Mails', 'Map', 'MapMinus', 'MapPin', 'MapPinCheck', 'MapPinCheckInside', 'MapPinHouse', 'MapPinMinus', 'MapPinMinusInside', 'MapPinOff', 'MapPinPen', 'MapPinPlus', 'MapPinPlusInside', 'MapPinSearch', 'MapPinX', 'MapPinXInside', 'MapPinned', 'MapPlus', 'Margin', 'MarginBottom', 'MarginHorizontal', 'MarginLeft', 'MarginRight', 'MarginTop', 'MarginVertical', 'Mars', 'MarsStroke', 'Martini', 'Maximize', 'Maximize2', 'Medal', 'Megaphone', 'MegaphoneOff', 'MemoryStick', 'Menu', 'Merge', 'MessageCircle', 'MessageCircleCheck', 'MessageCircleCode', 'MessageCircleDashed', 'MessageCircleDashedCheck', 'MessageCircleHeart', 'MessageCircleMore', 'MessageCircleOff', 'MessageCirclePlus', 'MessageCircleQuestionMark', 'MessageCircleReply', 'MessageCircleText', 'MessageCircleWarning', 'MessageCircleX', 'MessageSquare', 'MessageSquareCheck', 'MessageSquareCode', 'MessageSquareDashed', 'MessageSquareDiff', 'MessageSquareDot', 'MessageSquareHeart', 'MessageSquareLock', 'MessageSquareMore', 'MessageSquareOff', 'MessageSquarePlus', 'MessageSquareQuote', 'MessageSquareReply', 'MessageSquareShare', 'MessageSquareText', 'MessageSquareWarning', 'MessageSquareX', 'MessagesCircle', 'MessagesSquare', 'Metronome', 'Mic', 'MicAudioLines', 'MicOff', 'MicSignal', 'MicVocal', 'Microchip', 'Microscope', 'Microwave', 'MidiPort', 'Milestone', 'Milk', 'MilkOff', 'Minimize', 'Minimize2', 'Minus', 'MirrorRectangular', 'MirrorRound', 'Monitor', 'MonitorActivity', 'MonitorCheck', 'MonitorCloud', 'MonitorCog', 'MonitorDot', 'MonitorDown', 'MonitorOff', 'MonitorPause', 'MonitorPc', 'MonitorPlay', 'MonitorSmartphone', 'MonitorSpeaker', 'MonitorStop', 'MonitorUp', 'MonitorX', 'Moon', 'MoonStar', 'Mop', 'MopSparkles', 'Mosque', 'Motorbike', 'Mountain', 'MountainSnow', 'Mouse', 'MouseLeft', 'MouseOff', 'MousePointer', 'MousePointer2', 'MousePointer2Off', 'MousePointerBan', 'MousePointerClick', 'MouseRight', 'Mouth', 'MouthOff', 'Move', 'Move3d', 'MoveDiagonal', 'MoveDiagonal2', 'MoveDown', 'MoveDownLeft', 'MoveDownRight', 'MoveHorizontal', 'MoveLeft', 'MoveRight', 'MoveUp', 'MoveUpLeft', 'MoveUpRight', 'MoveVertical', 'Navigation', 'Navigation2', 'Navigation2Off', 'NavigationOff', 'NepaliRupee', 'Network', 'Newspaper', 'Nfc', 'NonBinary', 'Notebook', 'NotebookDot', 'NotebookPen', 'NotebookTabs', 'NotebookText', 'NotepadText', 'NotepadTextDashed', 'Numbers', 'Nut', 'NutOff', 'Octagon', 'OctagonAlert', 'OctagonMinus', 'OctagonPause', 'OctagonX', 'Omega', 'Option', 'Orbit', 'Origami', 'Package', 'Package2', 'PackageCheck', 'PackageMinus', 'PackageOpen', 'PackagePlus', 'PackageSearch', 'PackageX', 'PaintBucket', 'PaintRoller', 'Paintbrush', 'PaintbrushVertical', 'Palette', 'Panda', 'PanelBottom', 'PanelBottomClose', 'PanelBottomDashed', 'PanelBottomOpen', 'PanelLeft', 'PanelLeftClose', 'PanelLeftDashed', 'PanelLeftOpen', 'PanelLeftRightDashed', 'PanelRight', 'PanelRightClose', 'PanelRightDashed', 'PanelRightOpen', 'PanelTop', 'PanelTopBottomDashed', 'PanelTopClose', 'PanelTopDashed', 'PanelTopOpen', 'PanelsLeftBottom', 'PanelsRightBottom', 'PanelsTopLeft', 'PaperBag', 'Paperclip', 'Parasol', 'Parentheses', 'Park', 'ParkingMeter', 'PartyPopper', 'Pause', 'PawPrint', 'PcCase', 'Pen', 'PenLine', 'PenOff', 'PenTool', 'Pencil', 'PencilLine', 'PencilOff', 'PencilRuler', 'PencilSparkles', 'Pentagon', 'Percent', 'PerfumeBottle', 'PersonStanding', 'Phi', 'PhilippinePeso', 'Phone', 'PhoneCall', 'PhoneForwarded', 'PhoneIncoming', 'PhoneLog', 'PhoneMissed', 'PhoneOff', 'PhoneOutgoing', 'Pi', 'Piano', 'Pickaxe', 'PictureInPicture', 'PictureInPicture2', 'PiggyBank', 'Pilcrow', 'PilcrowLeft', 'PilcrowRight', 'Pill', 'PillBottle', 'Pin', 'PinOff', 'Pipette', 'Pizza', 'Plane', 'PlaneLanding', 'PlaneTakeoff', 'PlantPot', 'Play', 'PlayOff', 'PlayingCard', 'PlayingCards', 'PlayingCardsFan', 'Plug', 'Plug2', 'PlugZap', 'Plus', 'PocketKnife', 'Podium', 'Pointer', 'PointerOff', 'Popcorn', 'Popsicle', 'PoundSterling', 'Power', 'PowerOff', 'Presentation', 'Printer', 'Printer3d', 'PrinterCheck', 'PrinterX', 'Projector', 'Proportions', 'Puzzle', 'Pyramid', 'QrCode', 'Quote', 'Rabbit', 'Radar', 'Radiation', 'Radical', 'Radio', 'RadioOff', 'RadioReceiver', 'RadioTower', 'Radius', 'Rainbow', 'Rat', 'Ratio', 'Receipt', 'ReceiptCent', 'ReceiptEuro', 'ReceiptIndianRupee', 'ReceiptJapaneseYen', 'ReceiptPoundSterling', 'ReceiptRussianRuble', 'ReceiptSwissFranc', 'ReceiptText', 'ReceiptTurkishLira', 'RectangleCircle', 'RectangleEllipsis', 'RectangleGoggles', 'RectangleHorizontal', 'RectangleVertical', 'Recycle', 'Redo', 'Redo2', 'RedoDot', 'RefreshCcw', 'RefreshCcwDot', 'RefreshCw', 'RefreshCwOff', 'Refrigerator', 'Regex', 'RemoveFormatting', 'Repeat', 'Repeat1', 'Repeat2', 'RepeatOff', 'Replace', 'ReplaceAll', 'Reply', 'ReplyAll', 'Rewind', 'Ribbon', 'Road', 'RobotArm', 'RobotVacuum', 'Rocket', 'RockingChair', 'RollerCoaster', 'Rose', 'Rotate3d', 'RotateCcw', 'RotateCcwClock', 'RotateCcwKey', 'RotateCcwSquare', 'RotateCw', 'RotateCwClock', 'RotateCwFadingClock', 'RotateCwSquare', 'Route', 'RouteOff', 'Router', 'Rows2', 'Rows3', 'Rows4', 'Rss', 'RugbyBall', 'Ruler', 'RulerDimensionLine', 'RussianRuble', 'Sailboat', 'Salad', 'Sandwich', 'Satellite', 'SatelliteDish', 'SaudiRiyal', 'Save', 'SaveAll', 'SaveCheck', 'SaveOff', 'SavePen', 'SavePlus', 'Scale', 'Scale3d', 'Scaling', 'Scan', 'ScanBarcode', 'ScanBox', 'ScanEye', 'ScanFace', 'ScanHeart', 'ScanLine', 'ScanQrCode', 'ScanSearch', 'ScanSquare', 'ScanText', 'School', 'Scissors', 'ScissorsLineDashed', 'Scooter', 'ScratchBlocks', 'ScreenShare', 'ScreenShareOff', 'Screw', 'Scroll', 'ScrollText', 'Search', 'SearchAlert', 'SearchCheck', 'SearchCode', 'SearchSlash', 'SearchX', 'Section', 'Send', 'SendHorizontal', 'SendToBack', 'SeparatorHorizontal', 'SeparatorVertical', 'Server', 'ServerCog', 'ServerCrash', 'ServerNas', 'ServerOff', 'ServerPlus', 'Settings', 'Settings2', 'Shapes', 'Share', 'Share2', 'Sheet', 'Shell', 'ShelvingUnit', 'Shield', 'ShieldAlert', 'ShieldBan', 'ShieldCheck', 'ShieldCog', 'ShieldCogCorner', 'ShieldEllipsis', 'ShieldHalf', 'ShieldHouse', 'ShieldKeyhole', 'ShieldLock', 'ShieldMinus', 'ShieldOff', 'ShieldPlus', 'ShieldQuestionMark', 'ShieldUser', 'ShieldX', 'Ship', 'ShipCargo', 'ShipWheel', 'Shirt', 'ShoppingBag', 'ShoppingBasket', 'ShoppingCart', 'ShoppingCartMinus', 'ShoppingCartPlus', 'Shovel', 'ShowerHead', 'Shredder', 'Shrimp', 'ShrimpOff', 'Shrink', 'Shrub', 'Shuffle', 'Sigma', 'Signal', 'SignalHigh', 'SignalLow', 'SignalMedium', 'SignalZero', 'Signature', 'Signpost', 'SignpostBig', 'Siren', 'SirenOff', 'SixteenthNotes', 'SkipBack', 'SkipForward', 'Skull', 'Slash', 'Slice', 'SlidersHorizontal', 'SlidersVertical', 'Smartphone', 'SmartphoneCharging', 'SmartphoneNfc', 'SmartphoneUserRound', 'Snail', 'Snowflake', 'SoapDispenserDroplet', 'Sofa', 'SolarPanel', 'Soup', 'Space', 'Spade', 'Sparkle', 'Sparkles', 'Speaker', 'Speech', 'SpellCheck', 'SpellCheck2', 'Spline', 'SplinePointer', 'Split', 'Spool', 'SportShoe', 'Spotlight', 'SprayCan', 'Sprout', 'Square', 'SquareActivity', 'SquareArrowDown', 'SquareArrowDownLeft', 'SquareArrowDownRight', 'SquareArrowLeft', 'SquareArrowOutDownLeft', 'SquareArrowOutDownRight', 'SquareArrowOutUpLeft', 'SquareArrowOutUpRight', 'SquareArrowRight', 'SquareArrowRightEnter', 'SquareArrowRightExit', 'SquareArrowUp', 'SquareArrowUpLeft', 'SquareArrowUpRight', 'SquareAsterisk', 'SquareBookmark', 'SquareBottomDashedScissors', 'SquareCenterlineDashedHorizontal', 'SquareCenterlineDashedVertical', 'SquareChartGantt', 'SquareCheck', 'SquareCheckBig', 'SquareChevronDown', 'SquareChevronLeft', 'SquareChevronRight', 'SquareChevronUp', 'SquareChevronsDown', 'SquareChevronsLeft', 'SquareChevronsRight', 'SquareChevronsUp', 'SquareCode', 'SquareDashed', 'SquareDashedBottom', 'SquareDashedBottomCode', 'SquareDashedKanban', 'SquareDashedMousePointer', 'SquareDashedPlus', 'SquareDashedText', 'SquareDashedTopSolid', 'SquareDashedX', 'SquareDashedXCorner', 'SquareDimensions', 'SquareDivide', 'SquareDot', 'SquareEqual', 'SquareExclamationPoint', 'SquareFunction', 'SquareKanban', 'SquareKanbanPlus', 'SquareLetterA', 'SquareLetterB', 'SquareLetterC', 'SquareLetterD', 'SquareLetterE', 'SquareLetterF', 'SquareLetterG', 'SquareLetterH', 'SquareLetterI', 'SquareLetterJ', 'SquareLetterK', 'SquareLetterL', 'SquareLetterM', 'SquareLetterN', 'SquareLetterO', 'SquareLetterP', 'SquareLetterPOff', 'SquareLetterQ', 'SquareLetterR', 'SquareLetterS', 'SquareLetterT', 'SquareLetterU', 'SquareLetterV', 'SquareLetterW', 'SquareLetterX', 'SquareLetterY', 'SquareLetterZ', 'SquareLibrary', 'SquareMenu', 'SquareMinus', 'SquareMousePointer', 'SquareOff', 'SquarePadding', 'SquarePaddingBottom', 'SquarePaddingHorizontal', 'SquarePaddingLeft', 'SquarePaddingRight', 'SquarePaddingTop', 'SquarePaddingVertical', 'SquarePause', 'SquarePen', 'SquarePercent', 'SquarePi', 'SquarePilcrow', 'SquarePlay', 'SquarePlus', 'SquarePower', 'SquareRadical', 'SquareRoundCorner', 'SquareScissors', 'SquareSigma', 'SquareSlash', 'SquareSparkles', 'SquareSplitHorizontal', 'SquareSplitVertical', 'SquareSquare', 'SquareStack', 'SquareStar', 'SquareStop', 'SquareTerminal', 'SquareText', 'SquareUser', 'SquareUserRound', 'SquareX', 'SquaresExclude', 'SquaresIntersect', 'SquaresSubtract', 'SquaresUnite', 'Squircle', 'SquircleDashed', 'Squirrel', 'Stamp', 'Star', 'StarCheck', 'StarHalf', 'StarMinus', 'StarOff', 'StarPlus', 'StarX', 'StepBack', 'StepForward', 'Stethoscope', 'Sticker', 'StickyNote', 'StickyNoteCheck', 'StickyNoteMinus', 'StickyNoteOff', 'StickyNotePlus', 'StickyNoteX', 'StickyNotes', 'Stone', 'Store', 'StretchHorizontal', 'StretchVertical', 'Strikethrough', 'Subscript', 'Summary', 'Sun', 'SunDim', 'SunMedium', 'SunMoon', 'SunSnow', 'Sunrise', 'Sunset', 'Superscript', 'SwatchBook', 'SwissFranc', 'SwitchCamera', 'Sword', 'Swords', 'Syringe', 'Table', 'Table2', 'TableCellsMerge', 'TableCellsSplit', 'TableColumnsSplit', 'TableOfContents', 'TableProperties', 'TableRowsSplit', 'Tablet', 'TabletSmartphone', 'Tablets', 'Tag', 'TagPlus', 'TagX', 'Tags', 'Tally1', 'Tally2', 'Tally3', 'Tally4', 'Tally5', 'Tangent', 'Target', 'Telescope', 'Tent', 'TentTree', 'Terminal', 'TestTube', 'TestTubeDiagonal', 'TestTubes', 'TextAlignCenter', 'TextAlignEnd', 'TextAlignJustify', 'TextAlignJustifyCenter', 'TextAlignJustifyEnd', 'TextAlignJustifyStart', 'TextAlignStart', 'TextCursor', 'TextCursorInput', 'TextInitial', 'TextQuote', 'TextSearch', 'TextWrap', 'Theater', 'Thermometer', 'ThermometerSnowflake', 'ThermometerSun', 'ThumbsDown', 'ThumbsUp', 'TicTacToe', 'Ticket', 'TicketCheck', 'TicketMinus', 'TicketPercent', 'TicketPlus', 'TicketSlash', 'TicketX', 'Tickets', 'TicketsPlane', 'Timeline', 'Timer', 'TimerOff', 'TimerReset', 'ToggleLeft', 'ToggleRight', 'Toilet', 'Tombstone', 'ToolCase', 'Toolbox', 'Toothbrush', 'ToothbrushSparkles', 'Tornado', 'Torus', 'Touchpad', 'TouchpadOff', 'TowelRack', 'TowerControl', 'ToyBrick', 'Tractor', 'TrafficCone', 'Trailer', 'TrainFront', 'TrainFrontTunnel', 'TrainTrack', 'TramFront', 'Transgender', 'Trash', 'TrashOff', 'TreeDeciduous', 'TreePalm', 'TreePine', 'Trees', 'TrendingDown', 'TrendingUp', 'TrendingUpDown', 'Triangle', 'TriangleAlert', 'TriangleDashed', 'TriangleRight', 'TrianglesCenterlineDashedHorizontal', 'TrianglesCenterlineDashedVertical', 'Trophy', 'Truck', 'TruckElectric', 'TubeLotion', 'TurkishLira', 'Turntable', 'Turtle', 'Tv', 'TvMinimal', 'TvMinimalPlay', 'Type', 'TypeOutline', 'Umbrella', 'UmbrellaOff', 'Underline', 'Undo', 'Undo2', 'UndoDot', 'UnfoldHorizontal', 'UnfoldVertical', 'Ungroup', 'University', 'Unlink', 'Unlink2', 'Unplug', 'Upload', 'Usb', 'UsbCPort', 'User', 'UserCheck', 'UserCog', 'UserGroup', 'UserKey', 'UserLock', 'UserMinus', 'UserPen', 'UserPlus', 'UserRound', 'UserRoundArrowLeft', 'UserRoundCheck', 'UserRoundCog', 'UserRoundGroup', 'UserRoundKey', 'UserRoundMinus', 'UserRoundPen', 'UserRoundPlus', 'UserRoundSearch', 'UserRoundShield', 'UserRoundStar', 'UserRoundX', 'UserSearch', 'UserShield', 'UserStar', 'UserX', 'Users', 'UsersCollaboration', 'UsersRound', 'UsersRoundCollaboration', 'Utensils', 'UtensilsCrossed', 'UtilityPole', 'Van', 'Variable', 'Vault', 'VectorPolygon', 'VectorSquare', 'Vegan', 'VenetianMask', 'Venus', 'VenusAndMars', 'Vibrate', 'VibrateOff', 'Video', 'VideoOff', 'Videotape', 'View', 'Virus', 'VirusOff', 'Voicemail', 'Volleyball', 'Volume', 'Volume1', 'Volume2', 'VolumeOff', 'VolumeX', 'Vote', 'Wallet', 'WalletCards', 'WalletMinimal', 'Wallpaper', 'Wand', 'WandSparkles', 'Warehouse', 'WashingMachine', 'Watch', 'WavesArrowDown', 'WavesArrowUp', 'WavesHorizontal', 'WavesLadder', 'WavesVertical', 'Waypoints', 'Webcam', 'WebcamOff', 'Webhook', 'WebhookOff', 'Weight', 'WeightTilde', 'Wheat', 'WheatOff', 'Whistle', 'WholeWord', 'Wifi', 'WifiCog', 'WifiHigh', 'WifiLock', 'WifiLow', 'WifiOff', 'WifiPen', 'WifiSync', 'WifiZero', 'Wind', 'WindArrowDown', 'WindArrowUp', 'Wine', 'WineOff', 'Workflow', 'Worm', 'Wrench', 'WrenchOff', 'X', 'XLineTop', 'Zap', 'ZapOff', 'ZodiacAquarius', 'ZodiacAries', 'ZodiacCancer', 'ZodiacCapricorn', 'ZodiacGemini', 'ZodiacLeo', 'ZodiacLibra', 'ZodiacOphiuchus', 'ZodiacPisces', 'ZodiacSagittarius', 'ZodiacScorpio', 'ZodiacTaurus', 'ZodiacVirgo', 'ZoomIn', 'ZoomOut');
  CREATE TYPE "public"."enum_pages_blocks_image_text_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_call_to_action_style" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_grid_features_icon_name" AS ENUM('AArrowDown', 'AArrowUp', 'ALargeSmall', 'Accessibility', 'Activity', 'Ad', 'AirVent', 'Airplay', 'AlarmClock', 'AlarmClockCheck', 'AlarmClockMinus', 'AlarmClockOff', 'AlarmClockPlus', 'AlarmSmoke', 'AlignCenterHorizontal', 'AlignCenterVertical', 'AlignEndHorizontal', 'AlignEndVertical', 'AlignHorizontalDistributeCenter', 'AlignHorizontalDistributeEnd', 'AlignHorizontalDistributeStart', 'AlignHorizontalJustifyCenter', 'AlignHorizontalJustifyEnd', 'AlignHorizontalJustifyStart', 'AlignHorizontalSpaceAround', 'AlignHorizontalSpaceBetween', 'AlignStartHorizontal', 'AlignStartVertical', 'AlignVerticalDistributeCenter', 'AlignVerticalDistributeEnd', 'AlignVerticalDistributeStart', 'AlignVerticalJustifyCenter', 'AlignVerticalJustifyEnd', 'AlignVerticalJustifyStart', 'AlignVerticalSpaceAround', 'AlignVerticalSpaceBetween', 'Ambulance', 'Ampersand', 'Ampersands', 'Amphora', 'Anchor', 'Angle', 'Antenna', 'Anvil', 'Aperture', 'AppWindow', 'AppWindowMac', 'Apple', 'Archive', 'ArchiveArrowDown', 'ArchiveArrowUp', 'ArchiveX', 'Armchair', 'ArmenianDram', 'ArrowBigDown', 'ArrowBigDownDash', 'ArrowBigLeft', 'ArrowBigLeftDash', 'ArrowBigRight', 'ArrowBigRightDash', 'ArrowBigUp', 'ArrowBigUpDash', 'ArrowDown', 'ArrowDown01', 'ArrowDown10', 'ArrowDownAZ', 'ArrowDownFromLine', 'ArrowDownLeft', 'ArrowDownNarrowWide', 'ArrowDownRight', 'ArrowDownToDot', 'ArrowDownToLine', 'ArrowDownUp', 'ArrowDownWideNarrow', 'ArrowDownZA', 'ArrowLeft', 'ArrowLeftFromLine', 'ArrowLeftRight', 'ArrowLeftToLine', 'ArrowRight', 'ArrowRightFromLine', 'ArrowRightLeft', 'ArrowRightToLine', 'ArrowUp', 'ArrowUp01', 'ArrowUp10', 'ArrowUpAZ', 'ArrowUpDown', 'ArrowUpFromDot', 'ArrowUpFromLine', 'ArrowUpLeft', 'ArrowUpNarrowWide', 'ArrowUpRight', 'ArrowUpToLine', 'ArrowUpWideNarrow', 'ArrowUpZA', 'ArrowsUpFromLine', 'Asterisk', 'Astroid', 'AtSign', 'Atom', 'AudioLines', 'AudioLinesOff', 'AudioLinesX', 'AudioWaveform', 'Avocado', 'Award', 'Axe', 'Axis3d', 'AzerbaijaniManat', 'Baby', 'Backpack', 'Bacon', 'Badge', 'BadgeAlert', 'BadgeCent', 'BadgeCheck', 'BadgeDollarSign', 'BadgeEuro', 'BadgeIndianRupee', 'BadgeInfo', 'BadgeJapaneseYen', 'BadgeMinus', 'BadgePercent', 'BadgePlus', 'BadgePoundSterling', 'BadgeQuestionMark', 'BadgeRussianRuble', 'BadgeSwissFranc', 'BadgeTurkishLira', 'BadgeX', 'BaggageClaim', 'BallWave', 'Balloon', 'Ban', 'Banana', 'Bandage', 'BangladeshiTaka', 'Banknote', 'BanknoteArrowDown', 'BanknoteArrowUp', 'BanknoteCheck', 'BanknoteX', 'Barcode', 'Barrel', 'Baseline', 'Bath', 'Battery', 'BatteryCharging', 'BatteryFull', 'BatteryLow', 'BatteryMedium', 'BatteryPlus', 'BatteryWarning', 'Beaker', 'Bean', 'BeanOff', 'Bed', 'BedDouble', 'BedSingle', 'Beef', 'BeefOff', 'Beer', 'BeerOff', 'BelarusianRuble', 'Bell', 'BellCheck', 'BellDot', 'BellElectric', 'BellMinus', 'BellOff', 'BellPlus', 'BellRing', 'BetweenHorizontalEnd', 'BetweenHorizontalStart', 'BetweenVerticalEnd', 'BetweenVerticalStart', 'BicepsFlexed', 'Bike', 'Binary', 'Binoculars', 'Biohazard', 'Bird', 'Birdhouse', 'Bitcoin', 'Blend', 'Blender', 'Blinds', 'Blocks', 'Bluetooth', 'BluetoothConnected', 'BluetoothOff', 'BluetoothSearching', 'Bolt', 'Bomb', 'Bone', 'BoneFracture', 'Book', 'BookA', 'BookAlert', 'BookAudio', 'BookBookmark', 'BookCheck', 'BookCopy', 'BookDashed', 'BookDown', 'BookHeadphones', 'BookHeart', 'BookImage', 'BookKey', 'BookLock', 'BookMinus', 'BookOpen', 'BookOpenCheck', 'BookOpenText', 'BookPlus', 'BookSearch', 'BookText', 'BookType', 'BookUp', 'BookUp2', 'BookUser', 'BookX', 'Bookmark', 'BookmarkCheck', 'BookmarkMinus', 'BookmarkOff', 'BookmarkPlus', 'BookmarkX', 'BoomBox', 'Bot', 'BotMessageSquare', 'BotOff', 'BottleWine', 'BowArrow', 'Box', 'Boxes', 'BoxesLinked', 'Braces', 'Brackets', 'Brain', 'BrainCircuit', 'BrainCog', 'BrainOff', 'BrickWall', 'BrickWallFire', 'BrickWallShield', 'Bridge', 'Briefcase', 'BriefcaseBusiness', 'BriefcaseConveyorBelt', 'BriefcaseMedical', 'BriefcasePlus', 'BringToFront', 'Broccoli', 'Broom', 'BroomSparkles', 'Brush', 'BrushCleaning', 'Bubbles', 'Bug', 'BugOff', 'BugPlay', 'Building', 'BuildingComplex', 'BuildingComplexPlus', 'Bus', 'BusFront', 'Cable', 'CableCar', 'Cake', 'CakeSlice', 'Calculator', 'Calendar', 'Calendar1', 'CalendarArrowDown', 'CalendarArrowLeft', 'CalendarArrowRight', 'CalendarArrowUp', 'CalendarCheck', 'CalendarCheck2', 'CalendarChevronsLeft', 'CalendarChevronsRight', 'CalendarClock', 'CalendarCog', 'CalendarDays', 'CalendarFold', 'CalendarHeart', 'CalendarMinus', 'CalendarMinus2', 'CalendarOff', 'CalendarPlus', 'CalendarPlus2', 'CalendarRange', 'CalendarSearch', 'CalendarSync', 'CalendarX', 'CalendarX2', 'Calendars', 'Camera', 'CameraOff', 'Can', 'CanSoda', 'Candy', 'CandyCane', 'CandyOff', 'Cannabis', 'CannabisOff', 'Captions', 'CaptionsOff', 'Car', 'CarBattery', 'CarFront', 'CarTaxiFront', 'Caravan', 'CardSim', 'Carrot', 'Carton', 'CartonOff', 'CaseLower', 'CaseSensitive', 'CaseUpper', 'CassetteTape', 'Cast', 'Castle', 'Cat', 'Cctv', 'CctvOff', 'Certificate', 'ChartArea', 'ChartBar', 'ChartBarBig', 'ChartBarDecreasing', 'ChartBarIncreasing', 'ChartBarStacked', 'ChartBellCurve', 'ChartCandlestick', 'ChartColumn', 'ChartColumnBig', 'ChartColumnDecreasing', 'ChartColumnIncreasing', 'ChartColumnStacked', 'ChartGantt', 'ChartLine', 'ChartNetwork', 'ChartNoAxesColumn', 'ChartNoAxesColumnDecreasing', 'ChartNoAxesColumnIncreasing', 'ChartNoAxesCombined', 'ChartNoAxesGantt', 'ChartPie', 'ChartQuadrant', 'ChartRadar', 'ChartScatter', 'ChartSpline', 'Check', 'CheckCheck', 'CheckLine', 'ChefHat', 'Cherry', 'ChessBishop', 'ChessKing', 'ChessKnight', 'ChessPawn', 'ChessQueen', 'ChessRook', 'ChevronDown', 'ChevronFirst', 'ChevronLast', 'ChevronLeft', 'ChevronRight', 'ChevronUp', 'ChevronsDown', 'ChevronsDownUp', 'ChevronsLeft', 'ChevronsLeftRight', 'ChevronsLeftRightEllipsis', 'ChevronsRight', 'ChevronsRightLeft', 'ChevronsUp', 'ChevronsUpDown', 'Church', 'Cigarette', 'CigaretteOff', 'Circle', 'CircleAlert', 'CircleArrowDown', 'CircleArrowLeft', 'CircleArrowOutDownLeft', 'CircleArrowOutDownRight', 'CircleArrowOutUpLeft', 'CircleArrowOutUpRight', 'CircleArrowRight', 'CircleArrowUp', 'CircleCheck', 'CircleCheckBig', 'CircleChevronDown', 'CircleChevronLeft', 'CircleChevronRight', 'CircleChevronUp', 'CircleChevronsDown', 'CircleChevronsLeft', 'CircleChevronsRight', 'CircleChevronsUp', 'CircleDashed', 'CircleDashedCheck', 'CircleDivide', 'CircleDollarSign', 'CircleDot', 'CircleDotDashed', 'CircleEllipsis', 'CircleEqual', 'CircleEuro', 'CircleFadingArrowUp', 'CircleFadingPlay', 'CircleFadingPlus', 'CircleGauge', 'CircleLetterA', 'CircleLetterB', 'CircleLetterC', 'CircleLetterD', 'CircleLetterE', 'CircleLetterF', 'CircleLetterG', 'CircleLetterH', 'CircleLetterI', 'CircleLetterJ', 'CircleLetterK', 'CircleLetterL', 'CircleLetterM', 'CircleLetterN', 'CircleLetterO', 'CircleLetterP', 'CircleLetterPOff', 'CircleLetterQ', 'CircleLetterR', 'CircleLetterS', 'CircleLetterT', 'CircleLetterU', 'CircleLetterV', 'CircleLetterW', 'CircleLetterX', 'CircleLetterY', 'CircleLetterZ', 'CircleMinus', 'CircleOff', 'CirclePause', 'CirclePercent', 'CirclePile', 'CirclePlay', 'CirclePlus', 'CirclePoundSterling', 'CirclePower', 'CircleQuestionMark', 'CircleSlash', 'CircleSlash2', 'CircleSmall', 'CircleStar', 'CircleStop', 'CircleUser', 'CircleUserRound', 'CircleX', 'CircuitBoard', 'Citrus', 'Clapperboard', 'ClefAlto', 'ClefBass', 'ClefTreble', 'Clipboard', 'ClipboardCheck', 'ClipboardClock', 'ClipboardCopy', 'ClipboardList', 'ClipboardMinus', 'ClipboardPaste', 'ClipboardPen', 'ClipboardPenLine', 'ClipboardPlus', 'ClipboardType', 'ClipboardX', 'Clock', 'Clock1', 'Clock10', 'Clock11', 'Clock12', 'Clock2', 'Clock3', 'Clock4', 'Clock5', 'Clock6', 'Clock7', 'Clock8', 'Clock9', 'ClockAlert', 'ClockArrowDown', 'ClockArrowLeft', 'ClockArrowRight', 'ClockArrowUp', 'ClockCheck', 'ClockFading', 'ClockPlus', 'ClosedCaption', 'Cloud', 'CloudAlert', 'CloudBackup', 'CloudCheck', 'CloudCog', 'CloudDownload', 'CloudDrizzle', 'CloudFog', 'CloudHail', 'CloudLightning', 'CloudMoon', 'CloudMoonRain', 'CloudOff', 'CloudRain', 'CloudRainWind', 'CloudSnow', 'CloudSun', 'CloudSunRain', 'CloudSync', 'CloudUpload', 'Cloudy', 'Clover', 'Club', 'Code', 'CodeXml', 'Coffee', 'Cog', 'Coins', 'Columns2', 'Columns3', 'Columns3Cog', 'Columns4', 'Combine', 'Command', 'Compass', 'Component', 'Computer', 'ConciergeBell', 'Cone', 'Construction', 'Contact', 'ContactRound', 'Container', 'Contrast', 'Cookie', 'CookingPot', 'Copy', 'CopyCheck', 'CopyMinus', 'CopyPlus', 'CopySlash', 'CopyX', 'Copyleft', 'CornerDownLeft', 'CornerDownRight', 'CornerLeftDown', 'CornerLeftUp', 'CornerRightDown', 'CornerRightUp', 'CornerUpLeft', 'CornerUpRight', 'Cpu', 'CpuAi', 'CreativeCommons', 'CreditCard', 'CreditCardCheck', 'CreditCardMinus', 'CreditCardPlus', 'CreditCardReader', 'CreditCardX', 'Croissant', 'Crop', 'Cross', 'Crosshair', 'Crown', 'Cuboid', 'CupSoda', 'Cupcake', 'Currency', 'Cylinder', 'Dam', 'Database', 'DatabaseArrowDown', 'DatabaseArrowUp', 'DatabaseBackup', 'DatabaseCheck', 'DatabaseCog', 'DatabaseMinus', 'DatabasePlus', 'DatabaseSearch', 'DatabaseX', 'DatabaseZap', 'DecimalsArrowLeft', 'DecimalsArrowRight', 'Delete', 'Dessert', 'Diameter', 'Diamond', 'DiamondMinus', 'DiamondPercent', 'DiamondPlus', 'Dice1', 'Dice2', 'Dice3', 'Dice4', 'Dice5', 'Dice6', 'Dices', 'Diff', 'Disc', 'Disc2', 'Disc3', 'DiscAlbum', 'Divide', 'Dna', 'DnaOff', 'Dock', 'Dog', 'DollarSign', 'Dome', 'Donut', 'DoorClosed', 'DoorClosedCog', 'DoorClosedLocked', 'DoorClosedPackage', 'DoorOpen', 'DoorStairwell', 'Dot', 'Download', 'DraftingCompass', 'Drama', 'Drill', 'Drone', 'Droplet', 'DropletOff', 'Droplets', 'Drum', 'Drumstick', 'Dumbbell', 'Ear', 'EarOff', 'Earbuds', 'EarbudsOff', 'Earth', 'EarthLock', 'Eclipse', 'Egg', 'EggFried', 'EggOff', 'EighthNote', 'EighthNotes', 'Eject', 'Ellipse', 'Ellipsis', 'EllipsisVertical', 'EmiratiDirham', 'Engine', 'Equal', 'EqualApproximately', 'EqualApproximatelyNot', 'EqualNot', 'Eraser', 'EthernetPort', 'Euro', 'EvCharger', 'Expand', 'ExternalLink', 'Eye', 'EyeClosed', 'EyeDashed', 'EyeOff', 'FaceAngry', 'FaceExpressionless', 'FaceGrinning', 'FaceNeutral', 'FaceSlightlyFrowning', 'FaceSlightlySmiling', 'FaceSlightlySmilingPlus', 'Factory', 'Fan', 'FastForward', 'Faucet', 'Feather', 'Fence', 'FerrisWheel', 'File', 'FileArchive', 'FileAxis3d', 'FileBadge', 'FileBox', 'FileBraces', 'FileBracesCorner', 'FileChartColumn', 'FileChartColumnIncreasing', 'FileChartLine', 'FileChartPie', 'FileCheck', 'FileCheckCorner', 'FileClock', 'FileCode', 'FileCodeCorner', 'FileCog', 'FileDatabase', 'FileDiff', 'FileDigit', 'FileDown', 'FileExclamationPoint', 'FileHeadphone', 'FileHeart', 'FileImage', 'FileInput', 'FileKey', 'FileLock', 'FileMinus', 'FileMinusCorner', 'FileMusic', 'FileOutput', 'FilePen', 'FilePenLine', 'FilePlay', 'FilePlus', 'FilePlusCorner', 'FileQuestionMark', 'FileScan', 'FileSearch', 'FileSearchCorner', 'FileSignal', 'FileSliders', 'FileSpreadsheet', 'FileStack', 'FileSymlink', 'FileTerminal', 'FileText', 'FileType', 'FileTypeCorner', 'FileUp', 'FileUser', 'FileVideoCamera', 'FileVolume', 'FileX', 'FileXCorner', 'Files', 'Film', 'FingerprintPattern', 'FireExtinguisher', 'Fish', 'FishOff', 'FishSymbol', 'FishingHook', 'FishingRod', 'Flag', 'FlagOff', 'FlagTriangleLeft', 'FlagTriangleRight', 'Flame', 'FlameKindling', 'Flashlight', 'FlashlightOff', 'FlaskConical', 'FlaskConicalOff', 'FlaskRound', 'Flower', 'Flower2', 'Focus', 'FoldHorizontal', 'FoldVertical', 'Folder', 'FolderArchive', 'FolderBookmark', 'FolderCheck', 'FolderClock', 'FolderClosed', 'FolderCode', 'FolderCog', 'FolderDot', 'FolderDown', 'FolderGit', 'FolderGit2', 'FolderHeart', 'FolderInput', 'FolderKanban', 'FolderKey', 'FolderLock', 'FolderMinus', 'FolderOpen', 'FolderOpenDot', 'FolderOutput', 'FolderPen', 'FolderPlus', 'FolderRoot', 'FolderSearch', 'FolderSearch2', 'FolderSymlink', 'FolderSync', 'FolderTree', 'FolderUp', 'FolderUser', 'FolderUsers', 'FolderX', 'Folders', 'Footprints', 'Forklift', 'Form', 'Forward', 'Frame', 'Fuel', 'Fullscreen', 'Funnel', 'FunnelPlus', 'FunnelX', 'Galaxy', 'GalleryHorizontal', 'GalleryHorizontalEnd', 'GalleryThumbnails', 'GalleryVertical', 'GalleryVerticalEnd', 'Gamepad', 'Gamepad2', 'GamepadDirectional', 'GapHorizontal', 'GapVertical', 'Gauge', 'Gavel', 'Gem', 'GeorgianLari', 'Germ', 'GermOff', 'Ghost', 'Gift', 'GitBranch', 'GitBranchMinus', 'GitBranchPlus', 'GitCommitHorizontal', 'GitCommitVertical', 'GitCompare', 'GitCompareArrows', 'GitFork', 'GitGraph', 'GitMerge', 'GitMergeConflict', 'GitPullRequest', 'GitPullRequestArrow', 'GitPullRequestClosed', 'GitPullRequestCreate', 'GitPullRequestCreateArrow', 'GitPullRequestDraft', 'GlassWater', 'Glasses', 'Globe', 'GlobeCheck', 'GlobeCode', 'GlobeLock', 'GlobeOff', 'GlobeX', 'Goal', 'Gpu', 'GraduationCap', 'Grape', 'GraphHub', 'GraphStar', 'Grid2x2', 'Grid2x2Check', 'Grid2x2Plus', 'Grid2x2X', 'Grid3x2', 'Grid3x3', 'Grip', 'GripHorizontal', 'GripVertical', 'Groceries', 'Group', 'Guitar', 'GuitarElectric', 'HalfNote', 'Ham', 'Hamburger', 'Hammer', 'Hand', 'HandCoins', 'HandFist', 'HandGrab', 'HandHeart', 'HandHelping', 'HandMetal', 'HandPlatter', 'Handbag', 'HandleBottomRight', 'Handshake', 'HardDrive', 'HardDriveDownload', 'HardDriveUpload', 'HardHat', 'Hash', 'HatGlasses', 'Haze', 'Hd', 'HdmiPort', 'Heading1', 'Heading2', 'Heading3', 'Heading4', 'Heading5', 'Heading6', 'HeadphoneOff', 'Headphones', 'Headset', 'Heart', 'HeartCrack', 'HeartHandshake', 'HeartMinus', 'HeartOff', 'HeartPlus', 'HeartPulse', 'HeartX', 'Heater', 'Helicopter', 'Hexagon', 'Highlighter', 'HikingStick', 'HockeyStick', 'Hop', 'HopOff', 'Hospital', 'HotAirBalloon', 'Hotel', 'Hourglass', 'HourglassCog', 'House', 'HouseCog', 'HouseHeart', 'HousePlug', 'HousePlus', 'HouseWifi', 'Houses', 'IceCreamBowl', 'IceCreamCone', 'IdCard', 'IdCardLanyard', 'Image', 'ImageDown', 'ImageMinus', 'ImageOff', 'ImagePlay', 'ImagePlus', 'ImageUp', 'ImageUpscale', 'Images', 'Import', 'Inbox', 'IndianRupee', 'Infinity', 'Info', 'InspectionPanel', 'Italic', 'IterationCcw', 'IterationCw', 'IvBag', 'JapaneseYen', 'Joystick', 'Kanban', 'Kayak', 'KazakhTenge', 'Key', 'KeyRound', 'KeySquare', 'Keyboard', 'KeyboardMusic', 'KeyboardOff', 'Lambda', 'Lamp', 'LampCeiling', 'LampDesk', 'LampFloor', 'LampWallDown', 'LampWallUp', 'LandPlot', 'Landmark', 'Languages', 'Laptop', 'LaptopMinimal', 'LaptopMinimalCheck', 'Laser', 'Lasso', 'LassoSelect', 'LayerArrowDown', 'LayerArrowUp', 'Layers', 'Layers2', 'LayersArrowDown', 'LayersArrowUp', 'LayersMinus', 'LayersPlus', 'LayoutArrowDown', 'LayoutArrowRight', 'LayoutDashboard', 'LayoutFreeform', 'LayoutGrid', 'LayoutGridCircles', 'LayoutList', 'LayoutPanelLeft', 'LayoutPanelTop', 'LayoutTemplate', 'Leaf', 'LeafyGreen', 'Lectern', 'Lens', 'LensConcave', 'LensConvex', 'LetterA', 'LetterB', 'LetterC', 'LetterD', 'LetterE', 'LetterF', 'LetterG', 'LetterH', 'LetterI', 'LetterJ', 'LetterK', 'LetterL', 'LetterM', 'LetterN', 'LetterO', 'LetterP', 'LetterQ', 'LetterR', 'LetterS', 'LetterSpacing', 'LetterT', 'LetterU', 'LetterV', 'LetterW', 'LetterX', 'LetterY', 'LetterZ', 'Letters', 'Library', 'LibraryBig', 'LifeBuoy', 'Ligature', 'Lightbulb', 'LightbulbOff', 'Lighthouse', 'LineDotBottomVertical', 'LineDotLeftHorizontal', 'LineDotRightHorizontal', 'LineDotTopVertical', 'LineHeight', 'LineSquiggle', 'LineStyle', 'Link', 'Link2', 'Link2Off', 'List', 'ListCheck', 'ListChecks', 'ListChevronsDownUp', 'ListChevronsUpDown', 'ListClock', 'ListCollapse', 'ListEnd', 'ListFilter', 'ListFilterPlus', 'ListIndentDecrease', 'ListIndentIncrease', 'ListMinus', 'ListMusic', 'ListOrdered', 'ListPlus', 'ListRestart', 'ListSortAscending', 'ListSortDescending', 'ListStart', 'ListTodo', 'ListTree', 'ListVideo', 'ListX', 'Loader', 'LoaderCircle', 'LoaderPinwheel', 'Locate', 'LocateFixed', 'LocateOff', 'Lock', 'LockKeyhole', 'LockKeyholeOpen', 'LockOpen', 'LogIn', 'LogOut', 'Logs', 'Lollipop', 'Luggage', 'Magnet', 'Mail', 'MailBadge', 'MailCheck', 'MailClock', 'MailDot', 'MailMinus', 'MailOpen', 'MailPen', 'MailPlus', 'MailQuestionMark', 'MailSearch', 'MailWarning', 'MailX', 'Mailbox', 'Mails', 'Map', 'MapMinus', 'MapPin', 'MapPinCheck', 'MapPinCheckInside', 'MapPinHouse', 'MapPinMinus', 'MapPinMinusInside', 'MapPinOff', 'MapPinPen', 'MapPinPlus', 'MapPinPlusInside', 'MapPinSearch', 'MapPinX', 'MapPinXInside', 'MapPinned', 'MapPlus', 'Margin', 'MarginBottom', 'MarginHorizontal', 'MarginLeft', 'MarginRight', 'MarginTop', 'MarginVertical', 'Mars', 'MarsStroke', 'Martini', 'Maximize', 'Maximize2', 'Medal', 'Megaphone', 'MegaphoneOff', 'MemoryStick', 'Menu', 'Merge', 'MessageCircle', 'MessageCircleCheck', 'MessageCircleCode', 'MessageCircleDashed', 'MessageCircleDashedCheck', 'MessageCircleHeart', 'MessageCircleMore', 'MessageCircleOff', 'MessageCirclePlus', 'MessageCircleQuestionMark', 'MessageCircleReply', 'MessageCircleText', 'MessageCircleWarning', 'MessageCircleX', 'MessageSquare', 'MessageSquareCheck', 'MessageSquareCode', 'MessageSquareDashed', 'MessageSquareDiff', 'MessageSquareDot', 'MessageSquareHeart', 'MessageSquareLock', 'MessageSquareMore', 'MessageSquareOff', 'MessageSquarePlus', 'MessageSquareQuote', 'MessageSquareReply', 'MessageSquareShare', 'MessageSquareText', 'MessageSquareWarning', 'MessageSquareX', 'MessagesCircle', 'MessagesSquare', 'Metronome', 'Mic', 'MicAudioLines', 'MicOff', 'MicSignal', 'MicVocal', 'Microchip', 'Microscope', 'Microwave', 'MidiPort', 'Milestone', 'Milk', 'MilkOff', 'Minimize', 'Minimize2', 'Minus', 'MirrorRectangular', 'MirrorRound', 'Monitor', 'MonitorActivity', 'MonitorCheck', 'MonitorCloud', 'MonitorCog', 'MonitorDot', 'MonitorDown', 'MonitorOff', 'MonitorPause', 'MonitorPc', 'MonitorPlay', 'MonitorSmartphone', 'MonitorSpeaker', 'MonitorStop', 'MonitorUp', 'MonitorX', 'Moon', 'MoonStar', 'Mop', 'MopSparkles', 'Mosque', 'Motorbike', 'Mountain', 'MountainSnow', 'Mouse', 'MouseLeft', 'MouseOff', 'MousePointer', 'MousePointer2', 'MousePointer2Off', 'MousePointerBan', 'MousePointerClick', 'MouseRight', 'Mouth', 'MouthOff', 'Move', 'Move3d', 'MoveDiagonal', 'MoveDiagonal2', 'MoveDown', 'MoveDownLeft', 'MoveDownRight', 'MoveHorizontal', 'MoveLeft', 'MoveRight', 'MoveUp', 'MoveUpLeft', 'MoveUpRight', 'MoveVertical', 'Navigation', 'Navigation2', 'Navigation2Off', 'NavigationOff', 'NepaliRupee', 'Network', 'Newspaper', 'Nfc', 'NonBinary', 'Notebook', 'NotebookDot', 'NotebookPen', 'NotebookTabs', 'NotebookText', 'NotepadText', 'NotepadTextDashed', 'Numbers', 'Nut', 'NutOff', 'Octagon', 'OctagonAlert', 'OctagonMinus', 'OctagonPause', 'OctagonX', 'Omega', 'Option', 'Orbit', 'Origami', 'Package', 'Package2', 'PackageCheck', 'PackageMinus', 'PackageOpen', 'PackagePlus', 'PackageSearch', 'PackageX', 'PaintBucket', 'PaintRoller', 'Paintbrush', 'PaintbrushVertical', 'Palette', 'Panda', 'PanelBottom', 'PanelBottomClose', 'PanelBottomDashed', 'PanelBottomOpen', 'PanelLeft', 'PanelLeftClose', 'PanelLeftDashed', 'PanelLeftOpen', 'PanelLeftRightDashed', 'PanelRight', 'PanelRightClose', 'PanelRightDashed', 'PanelRightOpen', 'PanelTop', 'PanelTopBottomDashed', 'PanelTopClose', 'PanelTopDashed', 'PanelTopOpen', 'PanelsLeftBottom', 'PanelsRightBottom', 'PanelsTopLeft', 'PaperBag', 'Paperclip', 'Parasol', 'Parentheses', 'Park', 'ParkingMeter', 'PartyPopper', 'Pause', 'PawPrint', 'PcCase', 'Pen', 'PenLine', 'PenOff', 'PenTool', 'Pencil', 'PencilLine', 'PencilOff', 'PencilRuler', 'PencilSparkles', 'Pentagon', 'Percent', 'PerfumeBottle', 'PersonStanding', 'Phi', 'PhilippinePeso', 'Phone', 'PhoneCall', 'PhoneForwarded', 'PhoneIncoming', 'PhoneLog', 'PhoneMissed', 'PhoneOff', 'PhoneOutgoing', 'Pi', 'Piano', 'Pickaxe', 'PictureInPicture', 'PictureInPicture2', 'PiggyBank', 'Pilcrow', 'PilcrowLeft', 'PilcrowRight', 'Pill', 'PillBottle', 'Pin', 'PinOff', 'Pipette', 'Pizza', 'Plane', 'PlaneLanding', 'PlaneTakeoff', 'PlantPot', 'Play', 'PlayOff', 'PlayingCard', 'PlayingCards', 'PlayingCardsFan', 'Plug', 'Plug2', 'PlugZap', 'Plus', 'PocketKnife', 'Podium', 'Pointer', 'PointerOff', 'Popcorn', 'Popsicle', 'PoundSterling', 'Power', 'PowerOff', 'Presentation', 'Printer', 'Printer3d', 'PrinterCheck', 'PrinterX', 'Projector', 'Proportions', 'Puzzle', 'Pyramid', 'QrCode', 'Quote', 'Rabbit', 'Radar', 'Radiation', 'Radical', 'Radio', 'RadioOff', 'RadioReceiver', 'RadioTower', 'Radius', 'Rainbow', 'Rat', 'Ratio', 'Receipt', 'ReceiptCent', 'ReceiptEuro', 'ReceiptIndianRupee', 'ReceiptJapaneseYen', 'ReceiptPoundSterling', 'ReceiptRussianRuble', 'ReceiptSwissFranc', 'ReceiptText', 'ReceiptTurkishLira', 'RectangleCircle', 'RectangleEllipsis', 'RectangleGoggles', 'RectangleHorizontal', 'RectangleVertical', 'Recycle', 'Redo', 'Redo2', 'RedoDot', 'RefreshCcw', 'RefreshCcwDot', 'RefreshCw', 'RefreshCwOff', 'Refrigerator', 'Regex', 'RemoveFormatting', 'Repeat', 'Repeat1', 'Repeat2', 'RepeatOff', 'Replace', 'ReplaceAll', 'Reply', 'ReplyAll', 'Rewind', 'Ribbon', 'Road', 'RobotArm', 'RobotVacuum', 'Rocket', 'RockingChair', 'RollerCoaster', 'Rose', 'Rotate3d', 'RotateCcw', 'RotateCcwClock', 'RotateCcwKey', 'RotateCcwSquare', 'RotateCw', 'RotateCwClock', 'RotateCwFadingClock', 'RotateCwSquare', 'Route', 'RouteOff', 'Router', 'Rows2', 'Rows3', 'Rows4', 'Rss', 'RugbyBall', 'Ruler', 'RulerDimensionLine', 'RussianRuble', 'Sailboat', 'Salad', 'Sandwich', 'Satellite', 'SatelliteDish', 'SaudiRiyal', 'Save', 'SaveAll', 'SaveCheck', 'SaveOff', 'SavePen', 'SavePlus', 'Scale', 'Scale3d', 'Scaling', 'Scan', 'ScanBarcode', 'ScanBox', 'ScanEye', 'ScanFace', 'ScanHeart', 'ScanLine', 'ScanQrCode', 'ScanSearch', 'ScanSquare', 'ScanText', 'School', 'Scissors', 'ScissorsLineDashed', 'Scooter', 'ScratchBlocks', 'ScreenShare', 'ScreenShareOff', 'Screw', 'Scroll', 'ScrollText', 'Search', 'SearchAlert', 'SearchCheck', 'SearchCode', 'SearchSlash', 'SearchX', 'Section', 'Send', 'SendHorizontal', 'SendToBack', 'SeparatorHorizontal', 'SeparatorVertical', 'Server', 'ServerCog', 'ServerCrash', 'ServerNas', 'ServerOff', 'ServerPlus', 'Settings', 'Settings2', 'Shapes', 'Share', 'Share2', 'Sheet', 'Shell', 'ShelvingUnit', 'Shield', 'ShieldAlert', 'ShieldBan', 'ShieldCheck', 'ShieldCog', 'ShieldCogCorner', 'ShieldEllipsis', 'ShieldHalf', 'ShieldHouse', 'ShieldKeyhole', 'ShieldLock', 'ShieldMinus', 'ShieldOff', 'ShieldPlus', 'ShieldQuestionMark', 'ShieldUser', 'ShieldX', 'Ship', 'ShipCargo', 'ShipWheel', 'Shirt', 'ShoppingBag', 'ShoppingBasket', 'ShoppingCart', 'ShoppingCartMinus', 'ShoppingCartPlus', 'Shovel', 'ShowerHead', 'Shredder', 'Shrimp', 'ShrimpOff', 'Shrink', 'Shrub', 'Shuffle', 'Sigma', 'Signal', 'SignalHigh', 'SignalLow', 'SignalMedium', 'SignalZero', 'Signature', 'Signpost', 'SignpostBig', 'Siren', 'SirenOff', 'SixteenthNotes', 'SkipBack', 'SkipForward', 'Skull', 'Slash', 'Slice', 'SlidersHorizontal', 'SlidersVertical', 'Smartphone', 'SmartphoneCharging', 'SmartphoneNfc', 'SmartphoneUserRound', 'Snail', 'Snowflake', 'SoapDispenserDroplet', 'Sofa', 'SolarPanel', 'Soup', 'Space', 'Spade', 'Sparkle', 'Sparkles', 'Speaker', 'Speech', 'SpellCheck', 'SpellCheck2', 'Spline', 'SplinePointer', 'Split', 'Spool', 'SportShoe', 'Spotlight', 'SprayCan', 'Sprout', 'Square', 'SquareActivity', 'SquareArrowDown', 'SquareArrowDownLeft', 'SquareArrowDownRight', 'SquareArrowLeft', 'SquareArrowOutDownLeft', 'SquareArrowOutDownRight', 'SquareArrowOutUpLeft', 'SquareArrowOutUpRight', 'SquareArrowRight', 'SquareArrowRightEnter', 'SquareArrowRightExit', 'SquareArrowUp', 'SquareArrowUpLeft', 'SquareArrowUpRight', 'SquareAsterisk', 'SquareBookmark', 'SquareBottomDashedScissors', 'SquareCenterlineDashedHorizontal', 'SquareCenterlineDashedVertical', 'SquareChartGantt', 'SquareCheck', 'SquareCheckBig', 'SquareChevronDown', 'SquareChevronLeft', 'SquareChevronRight', 'SquareChevronUp', 'SquareChevronsDown', 'SquareChevronsLeft', 'SquareChevronsRight', 'SquareChevronsUp', 'SquareCode', 'SquareDashed', 'SquareDashedBottom', 'SquareDashedBottomCode', 'SquareDashedKanban', 'SquareDashedMousePointer', 'SquareDashedPlus', 'SquareDashedText', 'SquareDashedTopSolid', 'SquareDashedX', 'SquareDashedXCorner', 'SquareDimensions', 'SquareDivide', 'SquareDot', 'SquareEqual', 'SquareExclamationPoint', 'SquareFunction', 'SquareKanban', 'SquareKanbanPlus', 'SquareLetterA', 'SquareLetterB', 'SquareLetterC', 'SquareLetterD', 'SquareLetterE', 'SquareLetterF', 'SquareLetterG', 'SquareLetterH', 'SquareLetterI', 'SquareLetterJ', 'SquareLetterK', 'SquareLetterL', 'SquareLetterM', 'SquareLetterN', 'SquareLetterO', 'SquareLetterP', 'SquareLetterPOff', 'SquareLetterQ', 'SquareLetterR', 'SquareLetterS', 'SquareLetterT', 'SquareLetterU', 'SquareLetterV', 'SquareLetterW', 'SquareLetterX', 'SquareLetterY', 'SquareLetterZ', 'SquareLibrary', 'SquareMenu', 'SquareMinus', 'SquareMousePointer', 'SquareOff', 'SquarePadding', 'SquarePaddingBottom', 'SquarePaddingHorizontal', 'SquarePaddingLeft', 'SquarePaddingRight', 'SquarePaddingTop', 'SquarePaddingVertical', 'SquarePause', 'SquarePen', 'SquarePercent', 'SquarePi', 'SquarePilcrow', 'SquarePlay', 'SquarePlus', 'SquarePower', 'SquareRadical', 'SquareRoundCorner', 'SquareScissors', 'SquareSigma', 'SquareSlash', 'SquareSparkles', 'SquareSplitHorizontal', 'SquareSplitVertical', 'SquareSquare', 'SquareStack', 'SquareStar', 'SquareStop', 'SquareTerminal', 'SquareText', 'SquareUser', 'SquareUserRound', 'SquareX', 'SquaresExclude', 'SquaresIntersect', 'SquaresSubtract', 'SquaresUnite', 'Squircle', 'SquircleDashed', 'Squirrel', 'Stamp', 'Star', 'StarCheck', 'StarHalf', 'StarMinus', 'StarOff', 'StarPlus', 'StarX', 'StepBack', 'StepForward', 'Stethoscope', 'Sticker', 'StickyNote', 'StickyNoteCheck', 'StickyNoteMinus', 'StickyNoteOff', 'StickyNotePlus', 'StickyNoteX', 'StickyNotes', 'Stone', 'Store', 'StretchHorizontal', 'StretchVertical', 'Strikethrough', 'Subscript', 'Summary', 'Sun', 'SunDim', 'SunMedium', 'SunMoon', 'SunSnow', 'Sunrise', 'Sunset', 'Superscript', 'SwatchBook', 'SwissFranc', 'SwitchCamera', 'Sword', 'Swords', 'Syringe', 'Table', 'Table2', 'TableCellsMerge', 'TableCellsSplit', 'TableColumnsSplit', 'TableOfContents', 'TableProperties', 'TableRowsSplit', 'Tablet', 'TabletSmartphone', 'Tablets', 'Tag', 'TagPlus', 'TagX', 'Tags', 'Tally1', 'Tally2', 'Tally3', 'Tally4', 'Tally5', 'Tangent', 'Target', 'Telescope', 'Tent', 'TentTree', 'Terminal', 'TestTube', 'TestTubeDiagonal', 'TestTubes', 'TextAlignCenter', 'TextAlignEnd', 'TextAlignJustify', 'TextAlignJustifyCenter', 'TextAlignJustifyEnd', 'TextAlignJustifyStart', 'TextAlignStart', 'TextCursor', 'TextCursorInput', 'TextInitial', 'TextQuote', 'TextSearch', 'TextWrap', 'Theater', 'Thermometer', 'ThermometerSnowflake', 'ThermometerSun', 'ThumbsDown', 'ThumbsUp', 'TicTacToe', 'Ticket', 'TicketCheck', 'TicketMinus', 'TicketPercent', 'TicketPlus', 'TicketSlash', 'TicketX', 'Tickets', 'TicketsPlane', 'Timeline', 'Timer', 'TimerOff', 'TimerReset', 'ToggleLeft', 'ToggleRight', 'Toilet', 'Tombstone', 'ToolCase', 'Toolbox', 'Toothbrush', 'ToothbrushSparkles', 'Tornado', 'Torus', 'Touchpad', 'TouchpadOff', 'TowelRack', 'TowerControl', 'ToyBrick', 'Tractor', 'TrafficCone', 'Trailer', 'TrainFront', 'TrainFrontTunnel', 'TrainTrack', 'TramFront', 'Transgender', 'Trash', 'TrashOff', 'TreeDeciduous', 'TreePalm', 'TreePine', 'Trees', 'TrendingDown', 'TrendingUp', 'TrendingUpDown', 'Triangle', 'TriangleAlert', 'TriangleDashed', 'TriangleRight', 'TrianglesCenterlineDashedHorizontal', 'TrianglesCenterlineDashedVertical', 'Trophy', 'Truck', 'TruckElectric', 'TubeLotion', 'TurkishLira', 'Turntable', 'Turtle', 'Tv', 'TvMinimal', 'TvMinimalPlay', 'Type', 'TypeOutline', 'Umbrella', 'UmbrellaOff', 'Underline', 'Undo', 'Undo2', 'UndoDot', 'UnfoldHorizontal', 'UnfoldVertical', 'Ungroup', 'University', 'Unlink', 'Unlink2', 'Unplug', 'Upload', 'Usb', 'UsbCPort', 'User', 'UserCheck', 'UserCog', 'UserGroup', 'UserKey', 'UserLock', 'UserMinus', 'UserPen', 'UserPlus', 'UserRound', 'UserRoundArrowLeft', 'UserRoundCheck', 'UserRoundCog', 'UserRoundGroup', 'UserRoundKey', 'UserRoundMinus', 'UserRoundPen', 'UserRoundPlus', 'UserRoundSearch', 'UserRoundShield', 'UserRoundStar', 'UserRoundX', 'UserSearch', 'UserShield', 'UserStar', 'UserX', 'Users', 'UsersCollaboration', 'UsersRound', 'UsersRoundCollaboration', 'Utensils', 'UtensilsCrossed', 'UtilityPole', 'Van', 'Variable', 'Vault', 'VectorPolygon', 'VectorSquare', 'Vegan', 'VenetianMask', 'Venus', 'VenusAndMars', 'Vibrate', 'VibrateOff', 'Video', 'VideoOff', 'Videotape', 'View', 'Virus', 'VirusOff', 'Voicemail', 'Volleyball', 'Volume', 'Volume1', 'Volume2', 'VolumeOff', 'VolumeX', 'Vote', 'Wallet', 'WalletCards', 'WalletMinimal', 'Wallpaper', 'Wand', 'WandSparkles', 'Warehouse', 'WashingMachine', 'Watch', 'WavesArrowDown', 'WavesArrowUp', 'WavesHorizontal', 'WavesLadder', 'WavesVertical', 'Waypoints', 'Webcam', 'WebcamOff', 'Webhook', 'WebhookOff', 'Weight', 'WeightTilde', 'Wheat', 'WheatOff', 'Whistle', 'WholeWord', 'Wifi', 'WifiCog', 'WifiHigh', 'WifiLock', 'WifiLow', 'WifiOff', 'WifiPen', 'WifiSync', 'WifiZero', 'Wind', 'WindArrowDown', 'WindArrowUp', 'Wine', 'WineOff', 'Workflow', 'Worm', 'Wrench', 'WrenchOff', 'X', 'XLineTop', 'Zap', 'ZapOff', 'ZodiacAquarius', 'ZodiacAries', 'ZodiacCancer', 'ZodiacCapricorn', 'ZodiacGemini', 'ZodiacLeo', 'ZodiacLibra', 'ZodiacOphiuchus', 'ZodiacPisces', 'ZodiacSagittarius', 'ZodiacScorpio', 'ZodiacTaurus', 'ZodiacVirgo', 'ZoomIn', 'ZoomOut');
  CREATE TYPE "public"."enum__pages_v_blocks_image_text_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_payload_llm_instructions_entity_type" AS ENUM('collection', 'global');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "users_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "_users_v_version_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "_users_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_email" varchar NOT NULL,
  	"version_reset_password_token" varchar,
  	"version_reset_password_expiration" timestamp(3) with time zone,
  	"version_salt" varchar,
  	"version_hash" varchar,
  	"version_reset_password_requested_at" timestamp(3) with time zone,
  	"version_login_attempts" numeric DEFAULT 0,
  	"version_lock_until" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_users_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"original_filename" varchar,
  	"original_url" varchar,
  	"original_mime_type" varchar,
  	"original_filesize" numeric,
  	"original_width" numeric,
  	"original_height" numeric,
  	"original_prefix" varchar,
  	"original__objectkey" varchar,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"variants_thumbnail_url" varchar,
  	"variants_thumbnail_width" numeric,
  	"variants_thumbnail_height" numeric,
  	"variants_thumbnail_mime_type" varchar,
  	"variants_thumbnail_filesize" numeric,
  	"variants_thumbnail_filename" varchar,
  	"variants_thumbnail_prefix" varchar,
  	"variants_thumbnail__objectkey" varchar,
  	"variants_card_url" varchar,
  	"variants_card_width" numeric,
  	"variants_card_height" numeric,
  	"variants_card_mime_type" varchar,
  	"variants_card_filesize" numeric,
  	"variants_card_filename" varchar,
  	"variants_card_prefix" varchar,
  	"variants_card__objectkey" varchar
  );
  
  CREATE TABLE "media_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "_media_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_alt" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_url" varchar,
  	"version_thumbnail_u_r_l" varchar,
  	"version_filename" varchar,
  	"version_mime_type" varchar,
  	"version_filesize" numeric,
  	"version_width" numeric,
  	"version_height" numeric,
  	"version_original_filename" varchar,
  	"version_original_url" varchar,
  	"version_original_mime_type" varchar,
  	"version_original_filesize" numeric,
  	"version_original_width" numeric,
  	"version_original_height" numeric,
  	"version_original_prefix" varchar,
  	"version_original__objectkey" varchar,
  	"version_focal_x" numeric,
  	"version_focal_y" numeric,
  	"version_variants_thumbnail_url" varchar,
  	"version_variants_thumbnail_width" numeric,
  	"version_variants_thumbnail_height" numeric,
  	"version_variants_thumbnail_mime_type" varchar,
  	"version_variants_thumbnail_filesize" numeric,
  	"version_variants_thumbnail_filename" varchar,
  	"version_variants_thumbnail_prefix" varchar,
  	"version_variants_thumbnail__objectkey" varchar,
  	"version_variants_card_url" varchar,
  	"version_variants_card_width" numeric,
  	"version_variants_card_height" numeric,
  	"version_variants_card_mime_type" varchar,
  	"version_variants_card_filesize" numeric,
  	"version_variants_card_filename" varchar,
  	"version_variants_card_prefix" varchar,
  	"version_variants_card__objectkey" varchar,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_media_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "pages_blocks_call_to_action" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"text" varchar,
  	"button_label" varchar,
  	"button_link" varchar,
  	"style" "enum_pages_blocks_call_to_action_style" DEFAULT 'primary',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_grid_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"icon_name" "enum_pages_blocks_feature_grid_features_icon_name"
  );
  
  CREATE TABLE "pages_blocks_feature_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"subheading" varchar,
  	"background_image_id" integer,
  	"cta_label" varchar,
  	"cta_link" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" jsonb,
  	"image_id" integer NOT NULL,
  	"image_position" "enum_pages_blocks_image_text_image_position" DEFAULT 'left',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_call_to_action" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"text" varchar,
  	"button_label" varchar,
  	"button_link" varchar,
  	"style" "enum__pages_v_blocks_call_to_action_style" DEFAULT 'primary',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_grid_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"icon_name" "enum__pages_v_blocks_feature_grid_features_icon_name",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"subheading" varchar,
  	"background_image_id" integer,
  	"cta_label" varchar,
  	"cta_link" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" jsonb,
  	"image_id" integer NOT NULL,
  	"image_position" "enum__pages_v_blocks_image_text_image_position" DEFAULT 'left',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"pages_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_llm_instructions" (
  	"id" varchar PRIMARY KEY NOT NULL,
  	"entity_slug" varchar NOT NULL,
  	"entity_type" "enum_payload_llm_instructions_entity_type" NOT NULL,
  	"additional_instructions" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_llm_instructions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" varchar NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "navigation_header_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link" varchar NOT NULL,
  	"new_tab" boolean
  );
  
  CREATE TABLE "navigation_footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link" varchar NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "_navigation_v_version_header_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link" varchar NOT NULL,
  	"new_tab" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_navigation_v_version_footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_navigation_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_navigation_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'Mostheimer' NOT NULL,
  	"site_description" varchar,
  	"default_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_site_name" varchar DEFAULT 'Mostheimer' NOT NULL,
  	"version_site_description" varchar,
  	"version_default_og_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_site_settings_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "translations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"settings_title" varchar DEFAULT 'Settings' NOT NULL,
  	"settings_theme_heading" varchar DEFAULT 'Theme' NOT NULL,
  	"settings_theme_description" varchar DEFAULT 'Choose your preferred color scheme.' NOT NULL,
  	"settings_font_size_heading" varchar DEFAULT 'Font Size' NOT NULL,
  	"settings_font_size_description" varchar DEFAULT 'Adjust the base text size.' NOT NULL,
  	"settings_animations_heading" varchar DEFAULT 'Animations' NOT NULL,
  	"settings_animations_description" varchar DEFAULT 'Enable or disable smooth transitions.' NOT NULL,
  	"common_system" varchar DEFAULT 'System' NOT NULL,
  	"common_light" varchar DEFAULT 'Light' NOT NULL,
  	"common_dark" varchar DEFAULT 'Dark' NOT NULL,
  	"common_normal" varchar DEFAULT 'Normal' NOT NULL,
  	"common_large" varchar DEFAULT 'Large' NOT NULL,
  	"common_on" varchar DEFAULT 'Enabled' NOT NULL,
  	"common_off" varchar DEFAULT 'Disabled' NOT NULL,
  	"common_theme" varchar DEFAULT 'Theme' NOT NULL,
  	"common_settings_button_aria" varchar DEFAULT 'Personalize your experience' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "translations_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "_translations_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_settings_title" varchar DEFAULT 'Settings' NOT NULL,
  	"version_settings_theme_heading" varchar DEFAULT 'Theme' NOT NULL,
  	"version_settings_theme_description" varchar DEFAULT 'Choose your preferred color scheme.' NOT NULL,
  	"version_settings_font_size_heading" varchar DEFAULT 'Font Size' NOT NULL,
  	"version_settings_font_size_description" varchar DEFAULT 'Adjust the base text size.' NOT NULL,
  	"version_settings_animations_heading" varchar DEFAULT 'Animations' NOT NULL,
  	"version_settings_animations_description" varchar DEFAULT 'Enable or disable smooth transitions.' NOT NULL,
  	"version_common_system" varchar DEFAULT 'System' NOT NULL,
  	"version_common_light" varchar DEFAULT 'Light' NOT NULL,
  	"version_common_dark" varchar DEFAULT 'Dark' NOT NULL,
  	"version_common_normal" varchar DEFAULT 'Normal' NOT NULL,
  	"version_common_large" varchar DEFAULT 'Large' NOT NULL,
  	"version_common_on" varchar DEFAULT 'Enabled' NOT NULL,
  	"version_common_off" varchar DEFAULT 'Disabled' NOT NULL,
  	"version_common_theme" varchar DEFAULT 'Theme' NOT NULL,
  	"version_common_settings_button_aria" varchar DEFAULT 'Personalize your experience' NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_translations_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_users_v_version_sessions" ADD CONSTRAINT "_users_v_version_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_users_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_users_v" ADD CONSTRAINT "_users_v_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_users_v_rels" ADD CONSTRAINT "_users_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_users_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_users_v_rels" ADD CONSTRAINT "_users_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_media_v" ADD CONSTRAINT "_media_v_parent_id_media_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_media_v_rels" ADD CONSTRAINT "_media_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_media_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_media_v_rels" ADD CONSTRAINT "_media_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_call_to_action" ADD CONSTRAINT "pages_blocks_call_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_grid_features" ADD CONSTRAINT "pages_blocks_feature_grid_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_grid" ADD CONSTRAINT "pages_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_text" ADD CONSTRAINT "pages_blocks_image_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image_text" ADD CONSTRAINT "pages_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_call_to_action" ADD CONSTRAINT "_pages_v_blocks_call_to_action_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_grid_features" ADD CONSTRAINT "_pages_v_blocks_feature_grid_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_grid" ADD CONSTRAINT "_pages_v_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_background_image_id_media_id_fk" FOREIGN KEY ("background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_text" ADD CONSTRAINT "_pages_v_blocks_image_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image_text" ADD CONSTRAINT "_pages_v_blocks_image_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_llm_instructions_rels" ADD CONSTRAINT "payload_llm_instructions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_llm_instructions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_llm_instructions_rels" ADD CONSTRAINT "payload_llm_instructions_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_links" ADD CONSTRAINT "navigation_header_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_links" ADD CONSTRAINT "navigation_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_rels" ADD CONSTRAINT "navigation_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_header_links" ADD CONSTRAINT "_navigation_v_version_header_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_footer_links" ADD CONSTRAINT "_navigation_v_version_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_rels" ADD CONSTRAINT "_navigation_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_rels" ADD CONSTRAINT "_navigation_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_og_image_id_media_id_fk" FOREIGN KEY ("default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_default_og_image_id_media_id_fk" FOREIGN KEY ("version_default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v_rels" ADD CONSTRAINT "_site_settings_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_rels" ADD CONSTRAINT "_site_settings_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "translations_rels" ADD CONSTRAINT "translations_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."translations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "translations_rels" ADD CONSTRAINT "translations_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_translations_v_rels" ADD CONSTRAINT "_translations_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_translations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_translations_v_rels" ADD CONSTRAINT "_translations_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "users_rels_order_idx" ON "users_rels" USING btree ("order");
  CREATE INDEX "users_rels_parent_idx" ON "users_rels" USING btree ("parent_id");
  CREATE INDEX "users_rels_path_idx" ON "users_rels" USING btree ("path");
  CREATE INDEX "users_rels_users_id_idx" ON "users_rels" USING btree ("users_id");
  CREATE INDEX "_users_v_version_sessions_order_idx" ON "_users_v_version_sessions" USING btree ("_order");
  CREATE INDEX "_users_v_version_sessions_parent_id_idx" ON "_users_v_version_sessions" USING btree ("_parent_id");
  CREATE INDEX "_users_v_parent_idx" ON "_users_v" USING btree ("parent_id");
  CREATE INDEX "_users_v_version_version_updated_at_idx" ON "_users_v" USING btree ("version_updated_at");
  CREATE INDEX "_users_v_version_version_created_at_idx" ON "_users_v" USING btree ("version_created_at");
  CREATE INDEX "_users_v_version_version_email_idx" ON "_users_v" USING btree ("version_email");
  CREATE INDEX "_users_v_created_at_idx" ON "_users_v" USING btree ("created_at");
  CREATE INDEX "_users_v_updated_at_idx" ON "_users_v" USING btree ("updated_at");
  CREATE INDEX "_users_v_rels_order_idx" ON "_users_v_rels" USING btree ("order");
  CREATE INDEX "_users_v_rels_parent_idx" ON "_users_v_rels" USING btree ("parent_id");
  CREATE INDEX "_users_v_rels_path_idx" ON "_users_v_rels" USING btree ("path");
  CREATE INDEX "_users_v_rels_users_id_idx" ON "_users_v_rels" USING btree ("users_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_original_original_filename_idx" ON "media" USING btree ("original_filename");
  CREATE INDEX "media_variants_thumbnail_variants_thumbnail_filename_idx" ON "media" USING btree ("variants_thumbnail_filename");
  CREATE INDEX "media_variants_card_variants_card_filename_idx" ON "media" USING btree ("variants_card_filename");
  CREATE INDEX "media_rels_order_idx" ON "media_rels" USING btree ("order");
  CREATE INDEX "media_rels_parent_idx" ON "media_rels" USING btree ("parent_id");
  CREATE INDEX "media_rels_path_idx" ON "media_rels" USING btree ("path");
  CREATE INDEX "media_rels_users_id_idx" ON "media_rels" USING btree ("users_id");
  CREATE INDEX "_media_v_parent_idx" ON "_media_v" USING btree ("parent_id");
  CREATE INDEX "_media_v_version_version_updated_at_idx" ON "_media_v" USING btree ("version_updated_at");
  CREATE INDEX "_media_v_version_version_created_at_idx" ON "_media_v" USING btree ("version_created_at");
  CREATE INDEX "_media_v_version_version_filename_idx" ON "_media_v" USING btree ("version_filename");
  CREATE INDEX "_media_v_version_original_version_original_filename_idx" ON "_media_v" USING btree ("version_original_filename");
  CREATE INDEX "_media_v_version_variants_thumbnail_version_variants_thu_idx" ON "_media_v" USING btree ("version_variants_thumbnail_filename");
  CREATE INDEX "_media_v_version_variants_card_version_variants_card_fil_idx" ON "_media_v" USING btree ("version_variants_card_filename");
  CREATE INDEX "_media_v_created_at_idx" ON "_media_v" USING btree ("created_at");
  CREATE INDEX "_media_v_updated_at_idx" ON "_media_v" USING btree ("updated_at");
  CREATE INDEX "_media_v_rels_order_idx" ON "_media_v_rels" USING btree ("order");
  CREATE INDEX "_media_v_rels_parent_idx" ON "_media_v_rels" USING btree ("parent_id");
  CREATE INDEX "_media_v_rels_path_idx" ON "_media_v_rels" USING btree ("path");
  CREATE INDEX "_media_v_rels_users_id_idx" ON "_media_v_rels" USING btree ("users_id");
  CREATE INDEX "pages_blocks_call_to_action_order_idx" ON "pages_blocks_call_to_action" USING btree ("_order");
  CREATE INDEX "pages_blocks_call_to_action_parent_id_idx" ON "pages_blocks_call_to_action" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_call_to_action_path_idx" ON "pages_blocks_call_to_action" USING btree ("_path");
  CREATE INDEX "pages_blocks_call_to_action_locale_idx" ON "pages_blocks_call_to_action" USING btree ("_locale");
  CREATE INDEX "pages_blocks_feature_grid_features_order_idx" ON "pages_blocks_feature_grid_features" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_grid_features_parent_id_idx" ON "pages_blocks_feature_grid_features" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_grid_features_locale_idx" ON "pages_blocks_feature_grid_features" USING btree ("_locale");
  CREATE INDEX "pages_blocks_feature_grid_order_idx" ON "pages_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_grid_parent_id_idx" ON "pages_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_grid_path_idx" ON "pages_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_feature_grid_locale_idx" ON "pages_blocks_feature_grid" USING btree ("_locale");
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_locale_idx" ON "pages_blocks_hero" USING btree ("_locale");
  CREATE INDEX "pages_blocks_hero_background_image_idx" ON "pages_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "pages_blocks_image_text_order_idx" ON "pages_blocks_image_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_text_parent_id_idx" ON "pages_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_text_path_idx" ON "pages_blocks_image_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_text_locale_idx" ON "pages_blocks_image_text" USING btree ("_locale");
  CREATE INDEX "pages_blocks_image_text_image_idx" ON "pages_blocks_image_text" USING btree ("image_id");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_rich_text_locale_idx" ON "pages_blocks_rich_text" USING btree ("_locale");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE UNIQUE INDEX "pages_locales_parent_id_locale_unique" ON "pages_locales" USING btree ("_parent_id","_locale");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_users_id_idx" ON "pages_rels" USING btree ("users_id");
  CREATE INDEX "_pages_v_blocks_call_to_action_order_idx" ON "_pages_v_blocks_call_to_action" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_call_to_action_parent_id_idx" ON "_pages_v_blocks_call_to_action" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_call_to_action_path_idx" ON "_pages_v_blocks_call_to_action" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_call_to_action_locale_idx" ON "_pages_v_blocks_call_to_action" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_feature_grid_features_order_idx" ON "_pages_v_blocks_feature_grid_features" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_grid_features_parent_id_idx" ON "_pages_v_blocks_feature_grid_features" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_grid_features_locale_idx" ON "_pages_v_blocks_feature_grid_features" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_feature_grid_order_idx" ON "_pages_v_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_grid_parent_id_idx" ON "_pages_v_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_grid_path_idx" ON "_pages_v_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_grid_locale_idx" ON "_pages_v_blocks_feature_grid" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_locale_idx" ON "_pages_v_blocks_hero" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_hero_background_image_idx" ON "_pages_v_blocks_hero" USING btree ("background_image_id");
  CREATE INDEX "_pages_v_blocks_image_text_order_idx" ON "_pages_v_blocks_image_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_text_parent_id_idx" ON "_pages_v_blocks_image_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_text_path_idx" ON "_pages_v_blocks_image_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_text_locale_idx" ON "_pages_v_blocks_image_text" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_image_text_image_idx" ON "_pages_v_blocks_image_text" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_rich_text_locale_idx" ON "_pages_v_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_pages_v_locales_parent_id_locale_unique" ON "_pages_v_locales" USING btree ("_parent_id","_locale");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_users_id_idx" ON "_pages_v_rels" USING btree ("users_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "payload_llm_instructions_entity_slug_idx" ON "payload_llm_instructions" USING btree ("entity_slug");
  CREATE INDEX "payload_llm_instructions_updated_at_idx" ON "payload_llm_instructions" USING btree ("updated_at");
  CREATE INDEX "payload_llm_instructions_created_at_idx" ON "payload_llm_instructions" USING btree ("created_at");
  CREATE INDEX "payload_llm_instructions_rels_order_idx" ON "payload_llm_instructions_rels" USING btree ("order");
  CREATE INDEX "payload_llm_instructions_rels_parent_idx" ON "payload_llm_instructions_rels" USING btree ("parent_id");
  CREATE INDEX "payload_llm_instructions_rels_path_idx" ON "payload_llm_instructions_rels" USING btree ("path");
  CREATE INDEX "payload_llm_instructions_rels_users_id_idx" ON "payload_llm_instructions_rels" USING btree ("users_id");
  CREATE INDEX "navigation_header_links_order_idx" ON "navigation_header_links" USING btree ("_order");
  CREATE INDEX "navigation_header_links_parent_id_idx" ON "navigation_header_links" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_links_order_idx" ON "navigation_footer_links" USING btree ("_order");
  CREATE INDEX "navigation_footer_links_parent_id_idx" ON "navigation_footer_links" USING btree ("_parent_id");
  CREATE INDEX "navigation_rels_order_idx" ON "navigation_rels" USING btree ("order");
  CREATE INDEX "navigation_rels_parent_idx" ON "navigation_rels" USING btree ("parent_id");
  CREATE INDEX "navigation_rels_path_idx" ON "navigation_rels" USING btree ("path");
  CREATE INDEX "navigation_rels_users_id_idx" ON "navigation_rels" USING btree ("users_id");
  CREATE INDEX "_navigation_v_version_header_links_order_idx" ON "_navigation_v_version_header_links" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_header_links_parent_id_idx" ON "_navigation_v_version_header_links" USING btree ("_parent_id");
  CREATE INDEX "_navigation_v_version_footer_links_order_idx" ON "_navigation_v_version_footer_links" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_footer_links_parent_id_idx" ON "_navigation_v_version_footer_links" USING btree ("_parent_id");
  CREATE INDEX "_navigation_v_created_at_idx" ON "_navigation_v" USING btree ("created_at");
  CREATE INDEX "_navigation_v_updated_at_idx" ON "_navigation_v" USING btree ("updated_at");
  CREATE INDEX "_navigation_v_rels_order_idx" ON "_navigation_v_rels" USING btree ("order");
  CREATE INDEX "_navigation_v_rels_parent_idx" ON "_navigation_v_rels" USING btree ("parent_id");
  CREATE INDEX "_navigation_v_rels_path_idx" ON "_navigation_v_rels" USING btree ("path");
  CREATE INDEX "_navigation_v_rels_users_id_idx" ON "_navigation_v_rels" USING btree ("users_id");
  CREATE INDEX "site_settings_default_og_image_idx" ON "site_settings" USING btree ("default_og_image_id");
  CREATE INDEX "site_settings_rels_order_idx" ON "site_settings_rels" USING btree ("order");
  CREATE INDEX "site_settings_rels_parent_idx" ON "site_settings_rels" USING btree ("parent_id");
  CREATE INDEX "site_settings_rels_path_idx" ON "site_settings_rels" USING btree ("path");
  CREATE INDEX "site_settings_rels_users_id_idx" ON "site_settings_rels" USING btree ("users_id");
  CREATE INDEX "_site_settings_v_version_version_default_og_image_idx" ON "_site_settings_v" USING btree ("version_default_og_image_id");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "_site_settings_v_rels_order_idx" ON "_site_settings_v_rels" USING btree ("order");
  CREATE INDEX "_site_settings_v_rels_parent_idx" ON "_site_settings_v_rels" USING btree ("parent_id");
  CREATE INDEX "_site_settings_v_rels_path_idx" ON "_site_settings_v_rels" USING btree ("path");
  CREATE INDEX "_site_settings_v_rels_users_id_idx" ON "_site_settings_v_rels" USING btree ("users_id");
  CREATE INDEX "translations_rels_order_idx" ON "translations_rels" USING btree ("order");
  CREATE INDEX "translations_rels_parent_idx" ON "translations_rels" USING btree ("parent_id");
  CREATE INDEX "translations_rels_path_idx" ON "translations_rels" USING btree ("path");
  CREATE INDEX "translations_rels_users_id_idx" ON "translations_rels" USING btree ("users_id");
  CREATE INDEX "_translations_v_created_at_idx" ON "_translations_v" USING btree ("created_at");
  CREATE INDEX "_translations_v_updated_at_idx" ON "_translations_v" USING btree ("updated_at");
  CREATE INDEX "_translations_v_rels_order_idx" ON "_translations_v_rels" USING btree ("order");
  CREATE INDEX "_translations_v_rels_parent_idx" ON "_translations_v_rels" USING btree ("parent_id");
  CREATE INDEX "_translations_v_rels_path_idx" ON "_translations_v_rels" USING btree ("path");
  CREATE INDEX "_translations_v_rels_users_id_idx" ON "_translations_v_rels" USING btree ("users_id");`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "users_rels" CASCADE;
  DROP TABLE "_users_v_version_sessions" CASCADE;
  DROP TABLE "_users_v" CASCADE;
  DROP TABLE "_users_v_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_rels" CASCADE;
  DROP TABLE "_media_v" CASCADE;
  DROP TABLE "_media_v_rels" CASCADE;
  DROP TABLE "pages_blocks_call_to_action" CASCADE;
  DROP TABLE "pages_blocks_feature_grid_features" CASCADE;
  DROP TABLE "pages_blocks_feature_grid" CASCADE;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_image_text" CASCADE;
  DROP TABLE "pages_blocks_rich_text" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_call_to_action" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_grid_features" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_image_text" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "payload_llm_instructions" CASCADE;
  DROP TABLE "payload_llm_instructions_rels" CASCADE;
  DROP TABLE "navigation_header_links" CASCADE;
  DROP TABLE "navigation_footer_links" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "navigation_rels" CASCADE;
  DROP TABLE "_navigation_v_version_header_links" CASCADE;
  DROP TABLE "_navigation_v_version_footer_links" CASCADE;
  DROP TABLE "_navigation_v" CASCADE;
  DROP TABLE "_navigation_v_rels" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_rels" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TABLE "_site_settings_v_rels" CASCADE;
  DROP TABLE "translations" CASCADE;
  DROP TABLE "translations_rels" CASCADE;
  DROP TABLE "_translations_v" CASCADE;
  DROP TABLE "_translations_v_rels" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_pages_blocks_call_to_action_style";
  DROP TYPE "public"."enum_pages_blocks_feature_grid_features_icon_name";
  DROP TYPE "public"."enum_pages_blocks_image_text_image_position";
  DROP TYPE "public"."enum__pages_v_blocks_call_to_action_style";
  DROP TYPE "public"."enum__pages_v_blocks_feature_grid_features_icon_name";
  DROP TYPE "public"."enum__pages_v_blocks_image_text_image_position";
  DROP TYPE "public"."enum_payload_llm_instructions_entity_type";`);
}
