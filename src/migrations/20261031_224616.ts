import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_bento_grid_items_icon_name" AS ENUM('AArrowDown', 'AArrowUp', 'ALargeSmall', 'Accessibility', 'Activity', 'Ad', 'AirVent', 'Airplay', 'AlarmClock', 'AlarmClockCheck', 'AlarmClockMinus', 'AlarmClockOff', 'AlarmClockPlus', 'AlarmSmoke', 'AlignCenterHorizontal', 'AlignCenterVertical', 'AlignEndHorizontal', 'AlignEndVertical', 'AlignHorizontalDistributeCenter', 'AlignHorizontalDistributeEnd', 'AlignHorizontalDistributeStart', 'AlignHorizontalJustifyCenter', 'AlignHorizontalJustifyEnd', 'AlignHorizontalJustifyStart', 'AlignHorizontalSpaceAround', 'AlignHorizontalSpaceBetween', 'AlignStartHorizontal', 'AlignStartVertical', 'AlignVerticalDistributeCenter', 'AlignVerticalDistributeEnd', 'AlignVerticalDistributeStart', 'AlignVerticalJustifyCenter', 'AlignVerticalJustifyEnd', 'AlignVerticalJustifyStart', 'AlignVerticalSpaceAround', 'AlignVerticalSpaceBetween', 'Ambulance', 'Ampersand', 'Ampersands', 'Amphora', 'Anchor', 'Angle', 'Antenna', 'Anvil', 'Aperture', 'AppWindow', 'AppWindowMac', 'Apple', 'Archive', 'ArchiveArrowDown', 'ArchiveArrowUp', 'ArchiveX', 'Armchair', 'ArmenianDram', 'ArrowBigDown', 'ArrowBigDownDash', 'ArrowBigLeft', 'ArrowBigLeftDash', 'ArrowBigRight', 'ArrowBigRightDash', 'ArrowBigUp', 'ArrowBigUpDash', 'ArrowDown', 'ArrowDown01', 'ArrowDown10', 'ArrowDownAZ', 'ArrowDownFromLine', 'ArrowDownLeft', 'ArrowDownNarrowWide', 'ArrowDownRight', 'ArrowDownToDot', 'ArrowDownToLine', 'ArrowDownUp', 'ArrowDownWideNarrow', 'ArrowDownZA', 'ArrowLeft', 'ArrowLeftFromLine', 'ArrowLeftRight', 'ArrowLeftToLine', 'ArrowRight', 'ArrowRightFromLine', 'ArrowRightLeft', 'ArrowRightToLine', 'ArrowUp', 'ArrowUp01', 'ArrowUp10', 'ArrowUpAZ', 'ArrowUpDown', 'ArrowUpFromDot', 'ArrowUpFromLine', 'ArrowUpLeft', 'ArrowUpNarrowWide', 'ArrowUpRight', 'ArrowUpToLine', 'ArrowUpWideNarrow', 'ArrowUpZA', 'ArrowsUpFromLine', 'Asterisk', 'Astroid', 'AtSign', 'Atom', 'AudioLines', 'AudioLinesOff', 'AudioLinesX', 'AudioWaveform', 'Avocado', 'Award', 'Axe', 'Axis3d', 'AzerbaijaniManat', 'Baby', 'Backpack', 'Bacon', 'Badge', 'BadgeAlert', 'BadgeCent', 'BadgeCheck', 'BadgeDollarSign', 'BadgeEuro', 'BadgeIndianRupee', 'BadgeInfo', 'BadgeJapaneseYen', 'BadgeMinus', 'BadgePercent', 'BadgePlus', 'BadgePoundSterling', 'BadgeQuestionMark', 'BadgeRussianRuble', 'BadgeSwissFranc', 'BadgeTurkishLira', 'BadgeX', 'BaggageClaim', 'BallWave', 'Balloon', 'Ban', 'Banana', 'Bandage', 'BangladeshiTaka', 'Banknote', 'BanknoteArrowDown', 'BanknoteArrowUp', 'BanknoteCheck', 'BanknoteX', 'Barcode', 'Barrel', 'Baseline', 'Bath', 'Battery', 'BatteryCharging', 'BatteryFull', 'BatteryLow', 'BatteryMedium', 'BatteryPlus', 'BatteryWarning', 'Beaker', 'Bean', 'BeanOff', 'Bed', 'BedDouble', 'BedSingle', 'Beef', 'BeefOff', 'Beer', 'BeerOff', 'BelarusianRuble', 'Bell', 'BellCheck', 'BellDot', 'BellElectric', 'BellMinus', 'BellOff', 'BellPlus', 'BellRing', 'BetweenHorizontalEnd', 'BetweenHorizontalStart', 'BetweenVerticalEnd', 'BetweenVerticalStart', 'BicepsFlexed', 'Bike', 'Binary', 'Binoculars', 'Biohazard', 'Bird', 'Birdhouse', 'Bitcoin', 'Blend', 'Blender', 'Blinds', 'Blocks', 'Bluetooth', 'BluetoothConnected', 'BluetoothOff', 'BluetoothSearching', 'Bolt', 'Bomb', 'Bone', 'BoneFracture', 'Book', 'BookA', 'BookAlert', 'BookAudio', 'BookBookmark', 'BookCheck', 'BookCopy', 'BookDashed', 'BookDown', 'BookHeadphones', 'BookHeart', 'BookImage', 'BookKey', 'BookLock', 'BookMinus', 'BookOpen', 'BookOpenCheck', 'BookOpenText', 'BookPlus', 'BookSearch', 'BookText', 'BookType', 'BookUp', 'BookUp2', 'BookUser', 'BookX', 'Bookmark', 'BookmarkCheck', 'BookmarkMinus', 'BookmarkOff', 'BookmarkPlus', 'BookmarkX', 'BoomBox', 'Bot', 'BotMessageSquare', 'BotOff', 'BottleWine', 'BowArrow', 'Box', 'Boxes', 'BoxesLinked', 'Braces', 'Brackets', 'Brain', 'BrainCircuit', 'BrainCog', 'BrainOff', 'BrickWall', 'BrickWallFire', 'BrickWallShield', 'Bridge', 'Briefcase', 'BriefcaseBusiness', 'BriefcaseConveyorBelt', 'BriefcaseMedical', 'BriefcasePlus', 'BringToFront', 'Broccoli', 'Broom', 'BroomSparkles', 'Brush', 'BrushCleaning', 'Bubbles', 'Bug', 'BugOff', 'BugPlay', 'Building', 'BuildingComplex', 'BuildingComplexPlus', 'Bus', 'BusFront', 'Cable', 'CableCar', 'Cake', 'CakeSlice', 'Calculator', 'Calendar', 'Calendar1', 'CalendarArrowDown', 'CalendarArrowLeft', 'CalendarArrowRight', 'CalendarArrowUp', 'CalendarCheck', 'CalendarCheck2', 'CalendarChevronsLeft', 'CalendarChevronsRight', 'CalendarClock', 'CalendarCog', 'CalendarDays', 'CalendarFold', 'CalendarHeart', 'CalendarMinus', 'CalendarMinus2', 'CalendarOff', 'CalendarPlus', 'CalendarPlus2', 'CalendarRange', 'CalendarSearch', 'CalendarSync', 'CalendarX', 'CalendarX2', 'Calendars', 'Camera', 'CameraOff', 'Can', 'CanSoda', 'Candy', 'CandyCane', 'CandyOff', 'Cannabis', 'CannabisOff', 'Captions', 'CaptionsOff', 'Car', 'CarBattery', 'CarFront', 'CarTaxiFront', 'Caravan', 'CardSim', 'Carrot', 'Carton', 'CartonOff', 'CaseLower', 'CaseSensitive', 'CaseUpper', 'CassetteTape', 'Cast', 'Castle', 'Cat', 'Cctv', 'CctvOff', 'Certificate', 'ChartArea', 'ChartBar', 'ChartBarBig', 'ChartBarDecreasing', 'ChartBarIncreasing', 'ChartBarStacked', 'ChartBellCurve', 'ChartCandlestick', 'ChartColumn', 'ChartColumnBig', 'ChartColumnDecreasing', 'ChartColumnIncreasing', 'ChartColumnStacked', 'ChartGantt', 'ChartLine', 'ChartNetwork', 'ChartNoAxesColumn', 'ChartNoAxesColumnDecreasing', 'ChartNoAxesColumnIncreasing', 'ChartNoAxesCombined', 'ChartNoAxesGantt', 'ChartPie', 'ChartQuadrant', 'ChartRadar', 'ChartScatter', 'ChartSpline', 'Check', 'CheckCheck', 'CheckLine', 'ChefHat', 'Cherry', 'ChessBishop', 'ChessKing', 'ChessKnight', 'ChessPawn', 'ChessQueen', 'ChessRook', 'ChevronDown', 'ChevronFirst', 'ChevronLast', 'ChevronLeft', 'ChevronRight', 'ChevronUp', 'ChevronsDown', 'ChevronsDownUp', 'ChevronsLeft', 'ChevronsLeftRight', 'ChevronsLeftRightEllipsis', 'ChevronsRight', 'ChevronsRightLeft', 'ChevronsUp', 'ChevronsUpDown', 'Church', 'Cigarette', 'CigaretteOff', 'Circle', 'CircleAlert', 'CircleArrowDown', 'CircleArrowLeft', 'CircleArrowOutDownLeft', 'CircleArrowOutDownRight', 'CircleArrowOutUpLeft', 'CircleArrowOutUpRight', 'CircleArrowRight', 'CircleArrowUp', 'CircleCheck', 'CircleCheckBig', 'CircleChevronDown', 'CircleChevronLeft', 'CircleChevronRight', 'CircleChevronUp', 'CircleChevronsDown', 'CircleChevronsLeft', 'CircleChevronsRight', 'CircleChevronsUp', 'CircleDashed', 'CircleDashedCheck', 'CircleDivide', 'CircleDollarSign', 'CircleDot', 'CircleDotDashed', 'CircleEllipsis', 'CircleEqual', 'CircleEuro', 'CircleFadingArrowUp', 'CircleFadingPlay', 'CircleFadingPlus', 'CircleGauge', 'CircleLetterA', 'CircleLetterB', 'CircleLetterC', 'CircleLetterD', 'CircleLetterE', 'CircleLetterF', 'CircleLetterG', 'CircleLetterH', 'CircleLetterI', 'CircleLetterJ', 'CircleLetterK', 'CircleLetterL', 'CircleLetterM', 'CircleLetterN', 'CircleLetterO', 'CircleLetterP', 'CircleLetterPOff', 'CircleLetterQ', 'CircleLetterR', 'CircleLetterS', 'CircleLetterT', 'CircleLetterU', 'CircleLetterV', 'CircleLetterW', 'CircleLetterX', 'CircleLetterY', 'CircleLetterZ', 'CircleMinus', 'CircleOff', 'CirclePause', 'CirclePercent', 'CirclePile', 'CirclePlay', 'CirclePlus', 'CirclePoundSterling', 'CirclePower', 'CircleQuestionMark', 'CircleSlash', 'CircleSlash2', 'CircleSmall', 'CircleStar', 'CircleStop', 'CircleUser', 'CircleUserRound', 'CircleX', 'CircuitBoard', 'Citrus', 'Clapperboard', 'ClefAlto', 'ClefBass', 'ClefTreble', 'Clipboard', 'ClipboardCheck', 'ClipboardClock', 'ClipboardCopy', 'ClipboardList', 'ClipboardMinus', 'ClipboardPaste', 'ClipboardPen', 'ClipboardPenLine', 'ClipboardPlus', 'ClipboardType', 'ClipboardX', 'Clock', 'Clock1', 'Clock10', 'Clock11', 'Clock12', 'Clock2', 'Clock3', 'Clock4', 'Clock5', 'Clock6', 'Clock7', 'Clock8', 'Clock9', 'ClockAlert', 'ClockArrowDown', 'ClockArrowLeft', 'ClockArrowRight', 'ClockArrowUp', 'ClockCheck', 'ClockFading', 'ClockPlus', 'ClosedCaption', 'Cloud', 'CloudAlert', 'CloudBackup', 'CloudCheck', 'CloudCog', 'CloudDownload', 'CloudDrizzle', 'CloudFog', 'CloudHail', 'CloudLightning', 'CloudMoon', 'CloudMoonRain', 'CloudOff', 'CloudRain', 'CloudRainWind', 'CloudSnow', 'CloudSun', 'CloudSunRain', 'CloudSync', 'CloudUpload', 'Cloudy', 'Clover', 'Club', 'Code', 'CodeXml', 'Coffee', 'Cog', 'Coins', 'Columns2', 'Columns3', 'Columns3Cog', 'Columns4', 'Combine', 'Command', 'Compass', 'Component', 'Computer', 'ConciergeBell', 'Cone', 'Construction', 'Contact', 'ContactRound', 'Container', 'Contrast', 'Cookie', 'CookingPot', 'Copy', 'CopyCheck', 'CopyMinus', 'CopyPlus', 'CopySlash', 'CopyX', 'Copyleft', 'CornerDownLeft', 'CornerDownRight', 'CornerLeftDown', 'CornerLeftUp', 'CornerRightDown', 'CornerRightUp', 'CornerUpLeft', 'CornerUpRight', 'Cpu', 'CpuAi', 'CreativeCommons', 'CreditCard', 'CreditCardCheck', 'CreditCardMinus', 'CreditCardPlus', 'CreditCardReader', 'CreditCardX', 'Croissant', 'Crop', 'Cross', 'Crosshair', 'Crown', 'Cuboid', 'CupSoda', 'Cupcake', 'Currency', 'Cylinder', 'Dam', 'Database', 'DatabaseArrowDown', 'DatabaseArrowUp', 'DatabaseBackup', 'DatabaseCheck', 'DatabaseCog', 'DatabaseMinus', 'DatabasePlus', 'DatabaseSearch', 'DatabaseX', 'DatabaseZap', 'DecimalsArrowLeft', 'DecimalsArrowRight', 'Delete', 'Dessert', 'Diameter', 'Diamond', 'DiamondMinus', 'DiamondPercent', 'DiamondPlus', 'Dice1', 'Dice2', 'Dice3', 'Dice4', 'Dice5', 'Dice6', 'Dices', 'Diff', 'Disc', 'Disc2', 'Disc3', 'DiscAlbum', 'Divide', 'Dna', 'DnaOff', 'Dock', 'Dog', 'DollarSign', 'Dome', 'Donut', 'DoorClosed', 'DoorClosedCog', 'DoorClosedLocked', 'DoorClosedPackage', 'DoorOpen', 'DoorStairwell', 'Dot', 'Download', 'DraftingCompass', 'Drama', 'Drill', 'Drone', 'Droplet', 'DropletOff', 'Droplets', 'Drum', 'Drumstick', 'Dumbbell', 'Ear', 'EarOff', 'Earbuds', 'EarbudsOff', 'Earth', 'EarthLock', 'Eclipse', 'Egg', 'EggFried', 'EggOff', 'EighthNote', 'EighthNotes', 'Eject', 'Ellipse', 'Ellipsis', 'EllipsisVertical', 'EmiratiDirham', 'Engine', 'Equal', 'EqualApproximately', 'EqualApproximatelyNot', 'EqualNot', 'Eraser', 'EthernetPort', 'Euro', 'EvCharger', 'Expand', 'ExternalLink', 'Eye', 'EyeClosed', 'EyeDashed', 'EyeOff', 'FaceAngry', 'FaceExpressionless', 'FaceGrinning', 'FaceNeutral', 'FaceSlightlyFrowning', 'FaceSlightlySmiling', 'FaceSlightlySmilingPlus', 'Factory', 'Fan', 'FastForward', 'Faucet', 'Feather', 'Fence', 'FerrisWheel', 'File', 'FileArchive', 'FileAxis3d', 'FileBadge', 'FileBox', 'FileBraces', 'FileBracesCorner', 'FileChartColumn', 'FileChartColumnIncreasing', 'FileChartLine', 'FileChartPie', 'FileCheck', 'FileCheckCorner', 'FileClock', 'FileCode', 'FileCodeCorner', 'FileCog', 'FileDatabase', 'FileDiff', 'FileDigit', 'FileDown', 'FileExclamationPoint', 'FileHeadphone', 'FileHeart', 'FileImage', 'FileInput', 'FileKey', 'FileLock', 'FileMinus', 'FileMinusCorner', 'FileMusic', 'FileOutput', 'FilePen', 'FilePenLine', 'FilePlay', 'FilePlus', 'FilePlusCorner', 'FileQuestionMark', 'FileScan', 'FileSearch', 'FileSearchCorner', 'FileSignal', 'FileSliders', 'FileSpreadsheet', 'FileStack', 'FileSymlink', 'FileTerminal', 'FileText', 'FileType', 'FileTypeCorner', 'FileUp', 'FileUser', 'FileVideoCamera', 'FileVolume', 'FileX', 'FileXCorner', 'Files', 'Film', 'FingerprintPattern', 'FireExtinguisher', 'Fish', 'FishOff', 'FishSymbol', 'FishingHook', 'FishingRod', 'Flag', 'FlagOff', 'FlagTriangleLeft', 'FlagTriangleRight', 'Flame', 'FlameKindling', 'Flashlight', 'FlashlightOff', 'FlaskConical', 'FlaskConicalOff', 'FlaskRound', 'Flower', 'Flower2', 'Focus', 'FoldHorizontal', 'FoldVertical', 'Folder', 'FolderArchive', 'FolderBookmark', 'FolderCheck', 'FolderClock', 'FolderClosed', 'FolderCode', 'FolderCog', 'FolderDot', 'FolderDown', 'FolderGit', 'FolderGit2', 'FolderHeart', 'FolderInput', 'FolderKanban', 'FolderKey', 'FolderLock', 'FolderMinus', 'FolderOpen', 'FolderOpenDot', 'FolderOutput', 'FolderPen', 'FolderPlus', 'FolderRoot', 'FolderSearch', 'FolderSearch2', 'FolderSymlink', 'FolderSync', 'FolderTree', 'FolderUp', 'FolderUser', 'FolderUsers', 'FolderX', 'Folders', 'Footprints', 'Forklift', 'Form', 'Forward', 'Frame', 'Fuel', 'Fullscreen', 'Funnel', 'FunnelPlus', 'FunnelX', 'Galaxy', 'GalleryHorizontal', 'GalleryHorizontalEnd', 'GalleryThumbnails', 'GalleryVertical', 'GalleryVerticalEnd', 'Gamepad', 'Gamepad2', 'GamepadDirectional', 'GapHorizontal', 'GapVertical', 'Gauge', 'Gavel', 'Gem', 'GeorgianLari', 'Germ', 'GermOff', 'Ghost', 'Gift', 'GitBranch', 'GitBranchMinus', 'GitBranchPlus', 'GitCommitHorizontal', 'GitCommitVertical', 'GitCompare', 'GitCompareArrows', 'GitFork', 'GitGraph', 'GitMerge', 'GitMergeConflict', 'GitPullRequest', 'GitPullRequestArrow', 'GitPullRequestClosed', 'GitPullRequestCreate', 'GitPullRequestCreateArrow', 'GitPullRequestDraft', 'GlassWater', 'Glasses', 'Globe', 'GlobeCheck', 'GlobeCode', 'GlobeLock', 'GlobeOff', 'GlobeX', 'Goal', 'Gpu', 'GraduationCap', 'Grape', 'GraphHub', 'GraphStar', 'Grid2x2', 'Grid2x2Check', 'Grid2x2Plus', 'Grid2x2X', 'Grid3x2', 'Grid3x3', 'Grip', 'GripHorizontal', 'GripVertical', 'Groceries', 'Group', 'Guitar', 'GuitarElectric', 'HalfNote', 'Ham', 'Hamburger', 'Hammer', 'Hand', 'HandCoins', 'HandFist', 'HandGrab', 'HandHeart', 'HandHelping', 'HandMetal', 'HandPlatter', 'Handbag', 'HandleBottomRight', 'Handshake', 'HardDrive', 'HardDriveDownload', 'HardDriveUpload', 'HardHat', 'Hash', 'HatGlasses', 'Haze', 'Hd', 'HdmiPort', 'Heading1', 'Heading2', 'Heading3', 'Heading4', 'Heading5', 'Heading6', 'HeadphoneOff', 'Headphones', 'Headset', 'Heart', 'HeartCrack', 'HeartHandshake', 'HeartMinus', 'HeartOff', 'HeartPlus', 'HeartPulse', 'HeartX', 'Heater', 'Helicopter', 'Hexagon', 'Highlighter', 'HikingStick', 'HockeyStick', 'Hop', 'HopOff', 'Hospital', 'HotAirBalloon', 'Hotel', 'Hourglass', 'HourglassCog', 'House', 'HouseCog', 'HouseHeart', 'HousePlug', 'HousePlus', 'HouseWifi', 'Houses', 'IceCreamBowl', 'IceCreamCone', 'IdCard', 'IdCardLanyard', 'Image', 'ImageDown', 'ImageMinus', 'ImageOff', 'ImagePlay', 'ImagePlus', 'ImageUp', 'ImageUpscale', 'Images', 'Import', 'Inbox', 'IndianRupee', 'Infinity', 'Info', 'InspectionPanel', 'Italic', 'IterationCcw', 'IterationCw', 'IvBag', 'JapaneseYen', 'Joystick', 'Kanban', 'Kayak', 'KazakhTenge', 'Key', 'KeyRound', 'KeySquare', 'Keyboard', 'KeyboardMusic', 'KeyboardOff', 'Lambda', 'Lamp', 'LampCeiling', 'LampDesk', 'LampFloor', 'LampWallDown', 'LampWallUp', 'LandPlot', 'Landmark', 'Languages', 'Laptop', 'LaptopMinimal', 'LaptopMinimalCheck', 'Laser', 'Lasso', 'LassoSelect', 'LayerArrowDown', 'LayerArrowUp', 'Layers', 'Layers2', 'LayersArrowDown', 'LayersArrowUp', 'LayersMinus', 'LayersPlus', 'LayoutArrowDown', 'LayoutArrowRight', 'LayoutDashboard', 'LayoutFreeform', 'LayoutGrid', 'LayoutGridCircles', 'LayoutList', 'LayoutPanelLeft', 'LayoutPanelTop', 'LayoutTemplate', 'Leaf', 'LeafyGreen', 'Lectern', 'Lens', 'LensConcave', 'LensConvex', 'LetterA', 'LetterB', 'LetterC', 'LetterD', 'LetterE', 'LetterF', 'LetterG', 'LetterH', 'LetterI', 'LetterJ', 'LetterK', 'LetterL', 'LetterM', 'LetterN', 'LetterO', 'LetterP', 'LetterQ', 'LetterR', 'LetterS', 'LetterSpacing', 'LetterT', 'LetterU', 'LetterV', 'LetterW', 'LetterX', 'LetterY', 'LetterZ', 'Letters', 'Library', 'LibraryBig', 'LifeBuoy', 'Ligature', 'Lightbulb', 'LightbulbOff', 'Lighthouse', 'LineDotBottomVertical', 'LineDotLeftHorizontal', 'LineDotRightHorizontal', 'LineDotTopVertical', 'LineHeight', 'LineSquiggle', 'LineStyle', 'Link', 'Link2', 'Link2Off', 'List', 'ListCheck', 'ListChecks', 'ListChevronsDownUp', 'ListChevronsUpDown', 'ListClock', 'ListCollapse', 'ListEnd', 'ListFilter', 'ListFilterPlus', 'ListIndentDecrease', 'ListIndentIncrease', 'ListMinus', 'ListMusic', 'ListOrdered', 'ListPlus', 'ListRestart', 'ListSortAscending', 'ListSortDescending', 'ListStart', 'ListTodo', 'ListTree', 'ListVideo', 'ListX', 'Loader', 'LoaderCircle', 'LoaderPinwheel', 'Locate', 'LocateFixed', 'LocateOff', 'Lock', 'LockKeyhole', 'LockKeyholeOpen', 'LockOpen', 'LogIn', 'LogOut', 'Logs', 'Lollipop', 'Luggage', 'Magnet', 'Mail', 'MailBadge', 'MailCheck', 'MailClock', 'MailDot', 'MailMinus', 'MailOpen', 'MailPen', 'MailPlus', 'MailQuestionMark', 'MailSearch', 'MailWarning', 'MailX', 'Mailbox', 'Mails', 'Map', 'MapMinus', 'MapPin', 'MapPinCheck', 'MapPinCheckInside', 'MapPinHouse', 'MapPinMinus', 'MapPinMinusInside', 'MapPinOff', 'MapPinPen', 'MapPinPlus', 'MapPinPlusInside', 'MapPinSearch', 'MapPinX', 'MapPinXInside', 'MapPinned', 'MapPlus', 'Margin', 'MarginBottom', 'MarginHorizontal', 'MarginLeft', 'MarginRight', 'MarginTop', 'MarginVertical', 'Mars', 'MarsStroke', 'Martini', 'Maximize', 'Maximize2', 'Medal', 'Megaphone', 'MegaphoneOff', 'MemoryStick', 'Menu', 'Merge', 'MessageCircle', 'MessageCircleCheck', 'MessageCircleCode', 'MessageCircleDashed', 'MessageCircleDashedCheck', 'MessageCircleHeart', 'MessageCircleMore', 'MessageCircleOff', 'MessageCirclePlus', 'MessageCircleQuestionMark', 'MessageCircleReply', 'MessageCircleText', 'MessageCircleWarning', 'MessageCircleX', 'MessageSquare', 'MessageSquareCheck', 'MessageSquareCode', 'MessageSquareDashed', 'MessageSquareDiff', 'MessageSquareDot', 'MessageSquareHeart', 'MessageSquareLock', 'MessageSquareMore', 'MessageSquareOff', 'MessageSquarePlus', 'MessageSquareQuote', 'MessageSquareReply', 'MessageSquareShare', 'MessageSquareText', 'MessageSquareWarning', 'MessageSquareX', 'MessagesCircle', 'MessagesSquare', 'Metronome', 'Mic', 'MicAudioLines', 'MicOff', 'MicSignal', 'MicVocal', 'Microchip', 'Microscope', 'Microwave', 'MidiPort', 'Milestone', 'Milk', 'MilkOff', 'Minimize', 'Minimize2', 'Minus', 'MirrorRectangular', 'MirrorRound', 'Monitor', 'MonitorActivity', 'MonitorCheck', 'MonitorCloud', 'MonitorCog', 'MonitorDot', 'MonitorDown', 'MonitorOff', 'MonitorPause', 'MonitorPc', 'MonitorPlay', 'MonitorSmartphone', 'MonitorSpeaker', 'MonitorStop', 'MonitorUp', 'MonitorX', 'Moon', 'MoonStar', 'Mop', 'MopSparkles', 'Mosque', 'Motorbike', 'Mountain', 'MountainSnow', 'Mouse', 'MouseLeft', 'MouseOff', 'MousePointer', 'MousePointer2', 'MousePointer2Off', 'MousePointerBan', 'MousePointerClick', 'MouseRight', 'Mouth', 'MouthOff', 'Move', 'Move3d', 'MoveDiagonal', 'MoveDiagonal2', 'MoveDown', 'MoveDownLeft', 'MoveDownRight', 'MoveHorizontal', 'MoveLeft', 'MoveRight', 'MoveUp', 'MoveUpLeft', 'MoveUpRight', 'MoveVertical', 'Navigation', 'Navigation2', 'Navigation2Off', 'NavigationOff', 'NepaliRupee', 'Network', 'Newspaper', 'Nfc', 'NonBinary', 'Notebook', 'NotebookDot', 'NotebookPen', 'NotebookTabs', 'NotebookText', 'NotepadText', 'NotepadTextDashed', 'Numbers', 'Nut', 'NutOff', 'Octagon', 'OctagonAlert', 'OctagonMinus', 'OctagonPause', 'OctagonX', 'Omega', 'Option', 'Orbit', 'Origami', 'Package', 'Package2', 'PackageCheck', 'PackageMinus', 'PackageOpen', 'PackagePlus', 'PackageSearch', 'PackageX', 'PaintBucket', 'PaintRoller', 'Paintbrush', 'PaintbrushVertical', 'Palette', 'Panda', 'PanelBottom', 'PanelBottomClose', 'PanelBottomDashed', 'PanelBottomOpen', 'PanelLeft', 'PanelLeftClose', 'PanelLeftDashed', 'PanelLeftOpen', 'PanelLeftRightDashed', 'PanelRight', 'PanelRightClose', 'PanelRightDashed', 'PanelRightOpen', 'PanelTop', 'PanelTopBottomDashed', 'PanelTopClose', 'PanelTopDashed', 'PanelTopOpen', 'PanelsLeftBottom', 'PanelsRightBottom', 'PanelsTopLeft', 'PaperBag', 'Paperclip', 'Parasol', 'Parentheses', 'Park', 'ParkingMeter', 'PartyPopper', 'Pause', 'PawPrint', 'PcCase', 'Pen', 'PenLine', 'PenOff', 'PenTool', 'Pencil', 'PencilLine', 'PencilOff', 'PencilRuler', 'PencilSparkles', 'Pentagon', 'Percent', 'PerfumeBottle', 'PersonStanding', 'Phi', 'PhilippinePeso', 'Phone', 'PhoneCall', 'PhoneForwarded', 'PhoneIncoming', 'PhoneLog', 'PhoneMissed', 'PhoneOff', 'PhoneOutgoing', 'Pi', 'Piano', 'Pickaxe', 'PictureInPicture', 'PictureInPicture2', 'PiggyBank', 'Pilcrow', 'PilcrowLeft', 'PilcrowRight', 'Pill', 'PillBottle', 'Pin', 'PinOff', 'Pipette', 'Pizza', 'Plane', 'PlaneLanding', 'PlaneTakeoff', 'PlantPot', 'Play', 'PlayOff', 'PlayingCard', 'PlayingCards', 'PlayingCardsFan', 'Plug', 'Plug2', 'PlugZap', 'Plus', 'PocketKnife', 'Podium', 'Pointer', 'PointerOff', 'Popcorn', 'Popsicle', 'PoundSterling', 'Power', 'PowerOff', 'Presentation', 'Printer', 'Printer3d', 'PrinterCheck', 'PrinterX', 'Projector', 'Proportions', 'Puzzle', 'Pyramid', 'QrCode', 'Quote', 'Rabbit', 'Radar', 'Radiation', 'Radical', 'Radio', 'RadioOff', 'RadioReceiver', 'RadioTower', 'Radius', 'Rainbow', 'Rat', 'Ratio', 'Receipt', 'ReceiptCent', 'ReceiptEuro', 'ReceiptIndianRupee', 'ReceiptJapaneseYen', 'ReceiptPoundSterling', 'ReceiptRussianRuble', 'ReceiptSwissFranc', 'ReceiptText', 'ReceiptTurkishLira', 'RectangleCircle', 'RectangleEllipsis', 'RectangleGoggles', 'RectangleHorizontal', 'RectangleVertical', 'Recycle', 'Redo', 'Redo2', 'RedoDot', 'RefreshCcw', 'RefreshCcwDot', 'RefreshCw', 'RefreshCwOff', 'Refrigerator', 'Regex', 'RemoveFormatting', 'Repeat', 'Repeat1', 'Repeat2', 'RepeatOff', 'Replace', 'ReplaceAll', 'Reply', 'ReplyAll', 'Rewind', 'Ribbon', 'Road', 'RobotArm', 'RobotVacuum', 'Rocket', 'RockingChair', 'RollerCoaster', 'Rose', 'Rotate3d', 'RotateCcw', 'RotateCcwClock', 'RotateCcwKey', 'RotateCcwSquare', 'RotateCw', 'RotateCwClock', 'RotateCwFadingClock', 'RotateCwSquare', 'Route', 'RouteOff', 'Router', 'Rows2', 'Rows3', 'Rows4', 'Rss', 'RugbyBall', 'Ruler', 'RulerDimensionLine', 'RussianRuble', 'Sailboat', 'Salad', 'Sandwich', 'Satellite', 'SatelliteDish', 'SaudiRiyal', 'Save', 'SaveAll', 'SaveCheck', 'SaveOff', 'SavePen', 'SavePlus', 'Scale', 'Scale3d', 'Scaling', 'Scan', 'ScanBarcode', 'ScanBox', 'ScanEye', 'ScanFace', 'ScanHeart', 'ScanLine', 'ScanQrCode', 'ScanSearch', 'ScanSquare', 'ScanText', 'School', 'Scissors', 'ScissorsLineDashed', 'Scooter', 'ScratchBlocks', 'ScreenShare', 'ScreenShareOff', 'Screw', 'Scroll', 'ScrollText', 'Search', 'SearchAlert', 'SearchCheck', 'SearchCode', 'SearchSlash', 'SearchX', 'Section', 'Send', 'SendHorizontal', 'SendToBack', 'SeparatorHorizontal', 'SeparatorVertical', 'Server', 'ServerCog', 'ServerCrash', 'ServerNas', 'ServerOff', 'ServerPlus', 'Settings', 'Settings2', 'Shapes', 'Share', 'Share2', 'Sheet', 'Shell', 'ShelvingUnit', 'Shield', 'ShieldAlert', 'ShieldBan', 'ShieldCheck', 'ShieldCog', 'ShieldCogCorner', 'ShieldEllipsis', 'ShieldHalf', 'ShieldHouse', 'ShieldKeyhole', 'ShieldLock', 'ShieldMinus', 'ShieldOff', 'ShieldPlus', 'ShieldQuestionMark', 'ShieldUser', 'ShieldX', 'Ship', 'ShipCargo', 'ShipWheel', 'Shirt', 'ShoppingBag', 'ShoppingBasket', 'ShoppingCart', 'ShoppingCartMinus', 'ShoppingCartPlus', 'Shovel', 'ShowerHead', 'Shredder', 'Shrimp', 'ShrimpOff', 'Shrink', 'Shrub', 'Shuffle', 'Sigma', 'Signal', 'SignalHigh', 'SignalLow', 'SignalMedium', 'SignalZero', 'Signature', 'Signpost', 'SignpostBig', 'Siren', 'SirenOff', 'SixteenthNotes', 'SkipBack', 'SkipForward', 'Skull', 'Slash', 'Slice', 'SlidersHorizontal', 'SlidersVertical', 'Smartphone', 'SmartphoneCharging', 'SmartphoneNfc', 'SmartphoneUserRound', 'Snail', 'Snowflake', 'SoapDispenserDroplet', 'Sofa', 'SolarPanel', 'Soup', 'Space', 'Spade', 'Sparkle', 'Sparkles', 'Speaker', 'Speech', 'SpellCheck', 'SpellCheck2', 'Spline', 'SplinePointer', 'Split', 'Spool', 'SportShoe', 'Spotlight', 'SprayCan', 'Sprout', 'Square', 'SquareActivity', 'SquareArrowDown', 'SquareArrowDownLeft', 'SquareArrowDownRight', 'SquareArrowLeft', 'SquareArrowOutDownLeft', 'SquareArrowOutDownRight', 'SquareArrowOutUpLeft', 'SquareArrowOutUpRight', 'SquareArrowRight', 'SquareArrowRightEnter', 'SquareArrowRightExit', 'SquareArrowUp', 'SquareArrowUpLeft', 'SquareArrowUpRight', 'SquareAsterisk', 'SquareBookmark', 'SquareBottomDashedScissors', 'SquareCenterlineDashedHorizontal', 'SquareCenterlineDashedVertical', 'SquareChartGantt', 'SquareCheck', 'SquareCheckBig', 'SquareChevronDown', 'SquareChevronLeft', 'SquareChevronRight', 'SquareChevronUp', 'SquareChevronsDown', 'SquareChevronsLeft', 'SquareChevronsRight', 'SquareChevronsUp', 'SquareCode', 'SquareDashed', 'SquareDashedBottom', 'SquareDashedBottomCode', 'SquareDashedKanban', 'SquareDashedMousePointer', 'SquareDashedPlus', 'SquareDashedText', 'SquareDashedTopSolid', 'SquareDashedX', 'SquareDashedXCorner', 'SquareDimensions', 'SquareDivide', 'SquareDot', 'SquareEqual', 'SquareExclamationPoint', 'SquareFunction', 'SquareKanban', 'SquareKanbanPlus', 'SquareLetterA', 'SquareLetterB', 'SquareLetterC', 'SquareLetterD', 'SquareLetterE', 'SquareLetterF', 'SquareLetterG', 'SquareLetterH', 'SquareLetterI', 'SquareLetterJ', 'SquareLetterK', 'SquareLetterL', 'SquareLetterM', 'SquareLetterN', 'SquareLetterO', 'SquareLetterP', 'SquareLetterPOff', 'SquareLetterQ', 'SquareLetterR', 'SquareLetterS', 'SquareLetterT', 'SquareLetterU', 'SquareLetterV', 'SquareLetterW', 'SquareLetterX', 'SquareLetterY', 'SquareLetterZ', 'SquareLibrary', 'SquareMenu', 'SquareMinus', 'SquareMousePointer', 'SquareOff', 'SquarePadding', 'SquarePaddingBottom', 'SquarePaddingHorizontal', 'SquarePaddingLeft', 'SquarePaddingRight', 'SquarePaddingTop', 'SquarePaddingVertical', 'SquarePause', 'SquarePen', 'SquarePercent', 'SquarePi', 'SquarePilcrow', 'SquarePlay', 'SquarePlus', 'SquarePower', 'SquareRadical', 'SquareRoundCorner', 'SquareScissors', 'SquareSigma', 'SquareSlash', 'SquareSparkles', 'SquareSplitHorizontal', 'SquareSplitVertical', 'SquareSquare', 'SquareStack', 'SquareStar', 'SquareStop', 'SquareTerminal', 'SquareText', 'SquareUser', 'SquareUserRound', 'SquareX', 'SquaresExclude', 'SquaresIntersect', 'SquaresSubtract', 'SquaresUnite', 'Squircle', 'SquircleDashed', 'Squirrel', 'Stamp', 'Star', 'StarCheck', 'StarHalf', 'StarMinus', 'StarOff', 'StarPlus', 'StarX', 'StepBack', 'StepForward', 'Stethoscope', 'Sticker', 'StickyNote', 'StickyNoteCheck', 'StickyNoteMinus', 'StickyNoteOff', 'StickyNotePlus', 'StickyNoteX', 'StickyNotes', 'Stone', 'Store', 'StretchHorizontal', 'StretchVertical', 'Strikethrough', 'Subscript', 'Summary', 'Sun', 'SunDim', 'SunMedium', 'SunMoon', 'SunSnow', 'Sunrise', 'Sunset', 'Superscript', 'SwatchBook', 'SwissFranc', 'SwitchCamera', 'Sword', 'Swords', 'Syringe', 'Table', 'Table2', 'TableCellsMerge', 'TableCellsSplit', 'TableColumnsSplit', 'TableOfContents', 'TableProperties', 'TableRowsSplit', 'Tablet', 'TabletSmartphone', 'Tablets', 'Tag', 'TagPlus', 'TagX', 'Tags', 'Tally1', 'Tally2', 'Tally3', 'Tally4', 'Tally5', 'Tangent', 'Target', 'Telescope', 'Tent', 'TentTree', 'Terminal', 'TestTube', 'TestTubeDiagonal', 'TestTubes', 'TextAlignCenter', 'TextAlignEnd', 'TextAlignJustify', 'TextAlignJustifyCenter', 'TextAlignJustifyEnd', 'TextAlignJustifyStart', 'TextAlignStart', 'TextCursor', 'TextCursorInput', 'TextInitial', 'TextQuote', 'TextSearch', 'TextWrap', 'Theater', 'Thermometer', 'ThermometerSnowflake', 'ThermometerSun', 'ThumbsDown', 'ThumbsUp', 'TicTacToe', 'Ticket', 'TicketCheck', 'TicketMinus', 'TicketPercent', 'TicketPlus', 'TicketSlash', 'TicketX', 'Tickets', 'TicketsPlane', 'Timeline', 'Timer', 'TimerOff', 'TimerReset', 'ToggleLeft', 'ToggleRight', 'Toilet', 'Tombstone', 'ToolCase', 'Toolbox', 'Toothbrush', 'ToothbrushSparkles', 'Tornado', 'Torus', 'Touchpad', 'TouchpadOff', 'TowelRack', 'TowerControl', 'ToyBrick', 'Tractor', 'TrafficCone', 'Trailer', 'TrainFront', 'TrainFrontTunnel', 'TrainTrack', 'TramFront', 'Transgender', 'Trash', 'TrashOff', 'TreeDeciduous', 'TreePalm', 'TreePine', 'Trees', 'TrendingDown', 'TrendingUp', 'TrendingUpDown', 'Triangle', 'TriangleAlert', 'TriangleDashed', 'TriangleRight', 'TrianglesCenterlineDashedHorizontal', 'TrianglesCenterlineDashedVertical', 'Trophy', 'Truck', 'TruckElectric', 'TubeLotion', 'TurkishLira', 'Turntable', 'Turtle', 'Tv', 'TvMinimal', 'TvMinimalPlay', 'Type', 'TypeOutline', 'Umbrella', 'UmbrellaOff', 'Underline', 'Undo', 'Undo2', 'UndoDot', 'UnfoldHorizontal', 'UnfoldVertical', 'Ungroup', 'University', 'Unlink', 'Unlink2', 'Unplug', 'Upload', 'Usb', 'UsbCPort', 'User', 'UserCheck', 'UserCog', 'UserGroup', 'UserKey', 'UserLock', 'UserMinus', 'UserPen', 'UserPlus', 'UserRound', 'UserRoundArrowLeft', 'UserRoundCheck', 'UserRoundCog', 'UserRoundGroup', 'UserRoundKey', 'UserRoundMinus', 'UserRoundPen', 'UserRoundPlus', 'UserRoundSearch', 'UserRoundShield', 'UserRoundStar', 'UserRoundX', 'UserSearch', 'UserShield', 'UserStar', 'UserX', 'Users', 'UsersCollaboration', 'UsersRound', 'UsersRoundCollaboration', 'Utensils', 'UtensilsCrossed', 'UtilityPole', 'Van', 'Variable', 'Vault', 'VectorPolygon', 'VectorSquare', 'Vegan', 'VenetianMask', 'Venus', 'VenusAndMars', 'Vibrate', 'VibrateOff', 'Video', 'VideoOff', 'Videotape', 'View', 'Virus', 'VirusOff', 'Voicemail', 'Volleyball', 'Volume', 'Volume1', 'Volume2', 'VolumeOff', 'VolumeX', 'Vote', 'Wallet', 'WalletCards', 'WalletMinimal', 'Wallpaper', 'Wand', 'WandSparkles', 'Warehouse', 'WashingMachine', 'Watch', 'WavesArrowDown', 'WavesArrowUp', 'WavesHorizontal', 'WavesLadder', 'WavesVertical', 'Waypoints', 'Webcam', 'WebcamOff', 'Webhook', 'WebhookOff', 'Weight', 'WeightTilde', 'Wheat', 'WheatOff', 'Whistle', 'WholeWord', 'Wifi', 'WifiCog', 'WifiHigh', 'WifiLock', 'WifiLow', 'WifiOff', 'WifiPen', 'WifiSync', 'WifiZero', 'Wind', 'WindArrowDown', 'WindArrowUp', 'Wine', 'WineOff', 'Workflow', 'Worm', 'Wrench', 'WrenchOff', 'X', 'XLineTop', 'Zap', 'ZapOff', 'ZodiacAquarius', 'ZodiacAries', 'ZodiacCancer', 'ZodiacCapricorn', 'ZodiacGemini', 'ZodiacLeo', 'ZodiacLibra', 'ZodiacOphiuchus', 'ZodiacPisces', 'ZodiacSagittarius', 'ZodiacScorpio', 'ZodiacTaurus', 'ZodiacVirgo', 'ZoomIn', 'ZoomOut');
  CREATE TYPE "public"."enum__pages_v_blocks_bento_grid_items_icon_name" AS ENUM('AArrowDown', 'AArrowUp', 'ALargeSmall', 'Accessibility', 'Activity', 'Ad', 'AirVent', 'Airplay', 'AlarmClock', 'AlarmClockCheck', 'AlarmClockMinus', 'AlarmClockOff', 'AlarmClockPlus', 'AlarmSmoke', 'AlignCenterHorizontal', 'AlignCenterVertical', 'AlignEndHorizontal', 'AlignEndVertical', 'AlignHorizontalDistributeCenter', 'AlignHorizontalDistributeEnd', 'AlignHorizontalDistributeStart', 'AlignHorizontalJustifyCenter', 'AlignHorizontalJustifyEnd', 'AlignHorizontalJustifyStart', 'AlignHorizontalSpaceAround', 'AlignHorizontalSpaceBetween', 'AlignStartHorizontal', 'AlignStartVertical', 'AlignVerticalDistributeCenter', 'AlignVerticalDistributeEnd', 'AlignVerticalDistributeStart', 'AlignVerticalJustifyCenter', 'AlignVerticalJustifyEnd', 'AlignVerticalJustifyStart', 'AlignVerticalSpaceAround', 'AlignVerticalSpaceBetween', 'Ambulance', 'Ampersand', 'Ampersands', 'Amphora', 'Anchor', 'Angle', 'Antenna', 'Anvil', 'Aperture', 'AppWindow', 'AppWindowMac', 'Apple', 'Archive', 'ArchiveArrowDown', 'ArchiveArrowUp', 'ArchiveX', 'Armchair', 'ArmenianDram', 'ArrowBigDown', 'ArrowBigDownDash', 'ArrowBigLeft', 'ArrowBigLeftDash', 'ArrowBigRight', 'ArrowBigRightDash', 'ArrowBigUp', 'ArrowBigUpDash', 'ArrowDown', 'ArrowDown01', 'ArrowDown10', 'ArrowDownAZ', 'ArrowDownFromLine', 'ArrowDownLeft', 'ArrowDownNarrowWide', 'ArrowDownRight', 'ArrowDownToDot', 'ArrowDownToLine', 'ArrowDownUp', 'ArrowDownWideNarrow', 'ArrowDownZA', 'ArrowLeft', 'ArrowLeftFromLine', 'ArrowLeftRight', 'ArrowLeftToLine', 'ArrowRight', 'ArrowRightFromLine', 'ArrowRightLeft', 'ArrowRightToLine', 'ArrowUp', 'ArrowUp01', 'ArrowUp10', 'ArrowUpAZ', 'ArrowUpDown', 'ArrowUpFromDot', 'ArrowUpFromLine', 'ArrowUpLeft', 'ArrowUpNarrowWide', 'ArrowUpRight', 'ArrowUpToLine', 'ArrowUpWideNarrow', 'ArrowUpZA', 'ArrowsUpFromLine', 'Asterisk', 'Astroid', 'AtSign', 'Atom', 'AudioLines', 'AudioLinesOff', 'AudioLinesX', 'AudioWaveform', 'Avocado', 'Award', 'Axe', 'Axis3d', 'AzerbaijaniManat', 'Baby', 'Backpack', 'Bacon', 'Badge', 'BadgeAlert', 'BadgeCent', 'BadgeCheck', 'BadgeDollarSign', 'BadgeEuro', 'BadgeIndianRupee', 'BadgeInfo', 'BadgeJapaneseYen', 'BadgeMinus', 'BadgePercent', 'BadgePlus', 'BadgePoundSterling', 'BadgeQuestionMark', 'BadgeRussianRuble', 'BadgeSwissFranc', 'BadgeTurkishLira', 'BadgeX', 'BaggageClaim', 'BallWave', 'Balloon', 'Ban', 'Banana', 'Bandage', 'BangladeshiTaka', 'Banknote', 'BanknoteArrowDown', 'BanknoteArrowUp', 'BanknoteCheck', 'BanknoteX', 'Barcode', 'Barrel', 'Baseline', 'Bath', 'Battery', 'BatteryCharging', 'BatteryFull', 'BatteryLow', 'BatteryMedium', 'BatteryPlus', 'BatteryWarning', 'Beaker', 'Bean', 'BeanOff', 'Bed', 'BedDouble', 'BedSingle', 'Beef', 'BeefOff', 'Beer', 'BeerOff', 'BelarusianRuble', 'Bell', 'BellCheck', 'BellDot', 'BellElectric', 'BellMinus', 'BellOff', 'BellPlus', 'BellRing', 'BetweenHorizontalEnd', 'BetweenHorizontalStart', 'BetweenVerticalEnd', 'BetweenVerticalStart', 'BicepsFlexed', 'Bike', 'Binary', 'Binoculars', 'Biohazard', 'Bird', 'Birdhouse', 'Bitcoin', 'Blend', 'Blender', 'Blinds', 'Blocks', 'Bluetooth', 'BluetoothConnected', 'BluetoothOff', 'BluetoothSearching', 'Bolt', 'Bomb', 'Bone', 'BoneFracture', 'Book', 'BookA', 'BookAlert', 'BookAudio', 'BookBookmark', 'BookCheck', 'BookCopy', 'BookDashed', 'BookDown', 'BookHeadphones', 'BookHeart', 'BookImage', 'BookKey', 'BookLock', 'BookMinus', 'BookOpen', 'BookOpenCheck', 'BookOpenText', 'BookPlus', 'BookSearch', 'BookText', 'BookType', 'BookUp', 'BookUp2', 'BookUser', 'BookX', 'Bookmark', 'BookmarkCheck', 'BookmarkMinus', 'BookmarkOff', 'BookmarkPlus', 'BookmarkX', 'BoomBox', 'Bot', 'BotMessageSquare', 'BotOff', 'BottleWine', 'BowArrow', 'Box', 'Boxes', 'BoxesLinked', 'Braces', 'Brackets', 'Brain', 'BrainCircuit', 'BrainCog', 'BrainOff', 'BrickWall', 'BrickWallFire', 'BrickWallShield', 'Bridge', 'Briefcase', 'BriefcaseBusiness', 'BriefcaseConveyorBelt', 'BriefcaseMedical', 'BriefcasePlus', 'BringToFront', 'Broccoli', 'Broom', 'BroomSparkles', 'Brush', 'BrushCleaning', 'Bubbles', 'Bug', 'BugOff', 'BugPlay', 'Building', 'BuildingComplex', 'BuildingComplexPlus', 'Bus', 'BusFront', 'Cable', 'CableCar', 'Cake', 'CakeSlice', 'Calculator', 'Calendar', 'Calendar1', 'CalendarArrowDown', 'CalendarArrowLeft', 'CalendarArrowRight', 'CalendarArrowUp', 'CalendarCheck', 'CalendarCheck2', 'CalendarChevronsLeft', 'CalendarChevronsRight', 'CalendarClock', 'CalendarCog', 'CalendarDays', 'CalendarFold', 'CalendarHeart', 'CalendarMinus', 'CalendarMinus2', 'CalendarOff', 'CalendarPlus', 'CalendarPlus2', 'CalendarRange', 'CalendarSearch', 'CalendarSync', 'CalendarX', 'CalendarX2', 'Calendars', 'Camera', 'CameraOff', 'Can', 'CanSoda', 'Candy', 'CandyCane', 'CandyOff', 'Cannabis', 'CannabisOff', 'Captions', 'CaptionsOff', 'Car', 'CarBattery', 'CarFront', 'CarTaxiFront', 'Caravan', 'CardSim', 'Carrot', 'Carton', 'CartonOff', 'CaseLower', 'CaseSensitive', 'CaseUpper', 'CassetteTape', 'Cast', 'Castle', 'Cat', 'Cctv', 'CctvOff', 'Certificate', 'ChartArea', 'ChartBar', 'ChartBarBig', 'ChartBarDecreasing', 'ChartBarIncreasing', 'ChartBarStacked', 'ChartBellCurve', 'ChartCandlestick', 'ChartColumn', 'ChartColumnBig', 'ChartColumnDecreasing', 'ChartColumnIncreasing', 'ChartColumnStacked', 'ChartGantt', 'ChartLine', 'ChartNetwork', 'ChartNoAxesColumn', 'ChartNoAxesColumnDecreasing', 'ChartNoAxesColumnIncreasing', 'ChartNoAxesCombined', 'ChartNoAxesGantt', 'ChartPie', 'ChartQuadrant', 'ChartRadar', 'ChartScatter', 'ChartSpline', 'Check', 'CheckCheck', 'CheckLine', 'ChefHat', 'Cherry', 'ChessBishop', 'ChessKing', 'ChessKnight', 'ChessPawn', 'ChessQueen', 'ChessRook', 'ChevronDown', 'ChevronFirst', 'ChevronLast', 'ChevronLeft', 'ChevronRight', 'ChevronUp', 'ChevronsDown', 'ChevronsDownUp', 'ChevronsLeft', 'ChevronsLeftRight', 'ChevronsLeftRightEllipsis', 'ChevronsRight', 'ChevronsRightLeft', 'ChevronsUp', 'ChevronsUpDown', 'Church', 'Cigarette', 'CigaretteOff', 'Circle', 'CircleAlert', 'CircleArrowDown', 'CircleArrowLeft', 'CircleArrowOutDownLeft', 'CircleArrowOutDownRight', 'CircleArrowOutUpLeft', 'CircleArrowOutUpRight', 'CircleArrowRight', 'CircleArrowUp', 'CircleCheck', 'CircleCheckBig', 'CircleChevronDown', 'CircleChevronLeft', 'CircleChevronRight', 'CircleChevronUp', 'CircleChevronsDown', 'CircleChevronsLeft', 'CircleChevronsRight', 'CircleChevronsUp', 'CircleDashed', 'CircleDashedCheck', 'CircleDivide', 'CircleDollarSign', 'CircleDot', 'CircleDotDashed', 'CircleEllipsis', 'CircleEqual', 'CircleEuro', 'CircleFadingArrowUp', 'CircleFadingPlay', 'CircleFadingPlus', 'CircleGauge', 'CircleLetterA', 'CircleLetterB', 'CircleLetterC', 'CircleLetterD', 'CircleLetterE', 'CircleLetterF', 'CircleLetterG', 'CircleLetterH', 'CircleLetterI', 'CircleLetterJ', 'CircleLetterK', 'CircleLetterL', 'CircleLetterM', 'CircleLetterN', 'CircleLetterO', 'CircleLetterP', 'CircleLetterPOff', 'CircleLetterQ', 'CircleLetterR', 'CircleLetterS', 'CircleLetterT', 'CircleLetterU', 'CircleLetterV', 'CircleLetterW', 'CircleLetterX', 'CircleLetterY', 'CircleLetterZ', 'CircleMinus', 'CircleOff', 'CirclePause', 'CirclePercent', 'CirclePile', 'CirclePlay', 'CirclePlus', 'CirclePoundSterling', 'CirclePower', 'CircleQuestionMark', 'CircleSlash', 'CircleSlash2', 'CircleSmall', 'CircleStar', 'CircleStop', 'CircleUser', 'CircleUserRound', 'CircleX', 'CircuitBoard', 'Citrus', 'Clapperboard', 'ClefAlto', 'ClefBass', 'ClefTreble', 'Clipboard', 'ClipboardCheck', 'ClipboardClock', 'ClipboardCopy', 'ClipboardList', 'ClipboardMinus', 'ClipboardPaste', 'ClipboardPen', 'ClipboardPenLine', 'ClipboardPlus', 'ClipboardType', 'ClipboardX', 'Clock', 'Clock1', 'Clock10', 'Clock11', 'Clock12', 'Clock2', 'Clock3', 'Clock4', 'Clock5', 'Clock6', 'Clock7', 'Clock8', 'Clock9', 'ClockAlert', 'ClockArrowDown', 'ClockArrowLeft', 'ClockArrowRight', 'ClockArrowUp', 'ClockCheck', 'ClockFading', 'ClockPlus', 'ClosedCaption', 'Cloud', 'CloudAlert', 'CloudBackup', 'CloudCheck', 'CloudCog', 'CloudDownload', 'CloudDrizzle', 'CloudFog', 'CloudHail', 'CloudLightning', 'CloudMoon', 'CloudMoonRain', 'CloudOff', 'CloudRain', 'CloudRainWind', 'CloudSnow', 'CloudSun', 'CloudSunRain', 'CloudSync', 'CloudUpload', 'Cloudy', 'Clover', 'Club', 'Code', 'CodeXml', 'Coffee', 'Cog', 'Coins', 'Columns2', 'Columns3', 'Columns3Cog', 'Columns4', 'Combine', 'Command', 'Compass', 'Component', 'Computer', 'ConciergeBell', 'Cone', 'Construction', 'Contact', 'ContactRound', 'Container', 'Contrast', 'Cookie', 'CookingPot', 'Copy', 'CopyCheck', 'CopyMinus', 'CopyPlus', 'CopySlash', 'CopyX', 'Copyleft', 'CornerDownLeft', 'CornerDownRight', 'CornerLeftDown', 'CornerLeftUp', 'CornerRightDown', 'CornerRightUp', 'CornerUpLeft', 'CornerUpRight', 'Cpu', 'CpuAi', 'CreativeCommons', 'CreditCard', 'CreditCardCheck', 'CreditCardMinus', 'CreditCardPlus', 'CreditCardReader', 'CreditCardX', 'Croissant', 'Crop', 'Cross', 'Crosshair', 'Crown', 'Cuboid', 'CupSoda', 'Cupcake', 'Currency', 'Cylinder', 'Dam', 'Database', 'DatabaseArrowDown', 'DatabaseArrowUp', 'DatabaseBackup', 'DatabaseCheck', 'DatabaseCog', 'DatabaseMinus', 'DatabasePlus', 'DatabaseSearch', 'DatabaseX', 'DatabaseZap', 'DecimalsArrowLeft', 'DecimalsArrowRight', 'Delete', 'Dessert', 'Diameter', 'Diamond', 'DiamondMinus', 'DiamondPercent', 'DiamondPlus', 'Dice1', 'Dice2', 'Dice3', 'Dice4', 'Dice5', 'Dice6', 'Dices', 'Diff', 'Disc', 'Disc2', 'Disc3', 'DiscAlbum', 'Divide', 'Dna', 'DnaOff', 'Dock', 'Dog', 'DollarSign', 'Dome', 'Donut', 'DoorClosed', 'DoorClosedCog', 'DoorClosedLocked', 'DoorClosedPackage', 'DoorOpen', 'DoorStairwell', 'Dot', 'Download', 'DraftingCompass', 'Drama', 'Drill', 'Drone', 'Droplet', 'DropletOff', 'Droplets', 'Drum', 'Drumstick', 'Dumbbell', 'Ear', 'EarOff', 'Earbuds', 'EarbudsOff', 'Earth', 'EarthLock', 'Eclipse', 'Egg', 'EggFried', 'EggOff', 'EighthNote', 'EighthNotes', 'Eject', 'Ellipse', 'Ellipsis', 'EllipsisVertical', 'EmiratiDirham', 'Engine', 'Equal', 'EqualApproximately', 'EqualApproximatelyNot', 'EqualNot', 'Eraser', 'EthernetPort', 'Euro', 'EvCharger', 'Expand', 'ExternalLink', 'Eye', 'EyeClosed', 'EyeDashed', 'EyeOff', 'FaceAngry', 'FaceExpressionless', 'FaceGrinning', 'FaceNeutral', 'FaceSlightlyFrowning', 'FaceSlightlySmiling', 'FaceSlightlySmilingPlus', 'Factory', 'Fan', 'FastForward', 'Faucet', 'Feather', 'Fence', 'FerrisWheel', 'File', 'FileArchive', 'FileAxis3d', 'FileBadge', 'FileBox', 'FileBraces', 'FileBracesCorner', 'FileChartColumn', 'FileChartColumnIncreasing', 'FileChartLine', 'FileChartPie', 'FileCheck', 'FileCheckCorner', 'FileClock', 'FileCode', 'FileCodeCorner', 'FileCog', 'FileDatabase', 'FileDiff', 'FileDigit', 'FileDown', 'FileExclamationPoint', 'FileHeadphone', 'FileHeart', 'FileImage', 'FileInput', 'FileKey', 'FileLock', 'FileMinus', 'FileMinusCorner', 'FileMusic', 'FileOutput', 'FilePen', 'FilePenLine', 'FilePlay', 'FilePlus', 'FilePlusCorner', 'FileQuestionMark', 'FileScan', 'FileSearch', 'FileSearchCorner', 'FileSignal', 'FileSliders', 'FileSpreadsheet', 'FileStack', 'FileSymlink', 'FileTerminal', 'FileText', 'FileType', 'FileTypeCorner', 'FileUp', 'FileUser', 'FileVideoCamera', 'FileVolume', 'FileX', 'FileXCorner', 'Files', 'Film', 'FingerprintPattern', 'FireExtinguisher', 'Fish', 'FishOff', 'FishSymbol', 'FishingHook', 'FishingRod', 'Flag', 'FlagOff', 'FlagTriangleLeft', 'FlagTriangleRight', 'Flame', 'FlameKindling', 'Flashlight', 'FlashlightOff', 'FlaskConical', 'FlaskConicalOff', 'FlaskRound', 'Flower', 'Flower2', 'Focus', 'FoldHorizontal', 'FoldVertical', 'Folder', 'FolderArchive', 'FolderBookmark', 'FolderCheck', 'FolderClock', 'FolderClosed', 'FolderCode', 'FolderCog', 'FolderDot', 'FolderDown', 'FolderGit', 'FolderGit2', 'FolderHeart', 'FolderInput', 'FolderKanban', 'FolderKey', 'FolderLock', 'FolderMinus', 'FolderOpen', 'FolderOpenDot', 'FolderOutput', 'FolderPen', 'FolderPlus', 'FolderRoot', 'FolderSearch', 'FolderSearch2', 'FolderSymlink', 'FolderSync', 'FolderTree', 'FolderUp', 'FolderUser', 'FolderUsers', 'FolderX', 'Folders', 'Footprints', 'Forklift', 'Form', 'Forward', 'Frame', 'Fuel', 'Fullscreen', 'Funnel', 'FunnelPlus', 'FunnelX', 'Galaxy', 'GalleryHorizontal', 'GalleryHorizontalEnd', 'GalleryThumbnails', 'GalleryVertical', 'GalleryVerticalEnd', 'Gamepad', 'Gamepad2', 'GamepadDirectional', 'GapHorizontal', 'GapVertical', 'Gauge', 'Gavel', 'Gem', 'GeorgianLari', 'Germ', 'GermOff', 'Ghost', 'Gift', 'GitBranch', 'GitBranchMinus', 'GitBranchPlus', 'GitCommitHorizontal', 'GitCommitVertical', 'GitCompare', 'GitCompareArrows', 'GitFork', 'GitGraph', 'GitMerge', 'GitMergeConflict', 'GitPullRequest', 'GitPullRequestArrow', 'GitPullRequestClosed', 'GitPullRequestCreate', 'GitPullRequestCreateArrow', 'GitPullRequestDraft', 'GlassWater', 'Glasses', 'Globe', 'GlobeCheck', 'GlobeCode', 'GlobeLock', 'GlobeOff', 'GlobeX', 'Goal', 'Gpu', 'GraduationCap', 'Grape', 'GraphHub', 'GraphStar', 'Grid2x2', 'Grid2x2Check', 'Grid2x2Plus', 'Grid2x2X', 'Grid3x2', 'Grid3x3', 'Grip', 'GripHorizontal', 'GripVertical', 'Groceries', 'Group', 'Guitar', 'GuitarElectric', 'HalfNote', 'Ham', 'Hamburger', 'Hammer', 'Hand', 'HandCoins', 'HandFist', 'HandGrab', 'HandHeart', 'HandHelping', 'HandMetal', 'HandPlatter', 'Handbag', 'HandleBottomRight', 'Handshake', 'HardDrive', 'HardDriveDownload', 'HardDriveUpload', 'HardHat', 'Hash', 'HatGlasses', 'Haze', 'Hd', 'HdmiPort', 'Heading1', 'Heading2', 'Heading3', 'Heading4', 'Heading5', 'Heading6', 'HeadphoneOff', 'Headphones', 'Headset', 'Heart', 'HeartCrack', 'HeartHandshake', 'HeartMinus', 'HeartOff', 'HeartPlus', 'HeartPulse', 'HeartX', 'Heater', 'Helicopter', 'Hexagon', 'Highlighter', 'HikingStick', 'HockeyStick', 'Hop', 'HopOff', 'Hospital', 'HotAirBalloon', 'Hotel', 'Hourglass', 'HourglassCog', 'House', 'HouseCog', 'HouseHeart', 'HousePlug', 'HousePlus', 'HouseWifi', 'Houses', 'IceCreamBowl', 'IceCreamCone', 'IdCard', 'IdCardLanyard', 'Image', 'ImageDown', 'ImageMinus', 'ImageOff', 'ImagePlay', 'ImagePlus', 'ImageUp', 'ImageUpscale', 'Images', 'Import', 'Inbox', 'IndianRupee', 'Infinity', 'Info', 'InspectionPanel', 'Italic', 'IterationCcw', 'IterationCw', 'IvBag', 'JapaneseYen', 'Joystick', 'Kanban', 'Kayak', 'KazakhTenge', 'Key', 'KeyRound', 'KeySquare', 'Keyboard', 'KeyboardMusic', 'KeyboardOff', 'Lambda', 'Lamp', 'LampCeiling', 'LampDesk', 'LampFloor', 'LampWallDown', 'LampWallUp', 'LandPlot', 'Landmark', 'Languages', 'Laptop', 'LaptopMinimal', 'LaptopMinimalCheck', 'Laser', 'Lasso', 'LassoSelect', 'LayerArrowDown', 'LayerArrowUp', 'Layers', 'Layers2', 'LayersArrowDown', 'LayersArrowUp', 'LayersMinus', 'LayersPlus', 'LayoutArrowDown', 'LayoutArrowRight', 'LayoutDashboard', 'LayoutFreeform', 'LayoutGrid', 'LayoutGridCircles', 'LayoutList', 'LayoutPanelLeft', 'LayoutPanelTop', 'LayoutTemplate', 'Leaf', 'LeafyGreen', 'Lectern', 'Lens', 'LensConcave', 'LensConvex', 'LetterA', 'LetterB', 'LetterC', 'LetterD', 'LetterE', 'LetterF', 'LetterG', 'LetterH', 'LetterI', 'LetterJ', 'LetterK', 'LetterL', 'LetterM', 'LetterN', 'LetterO', 'LetterP', 'LetterQ', 'LetterR', 'LetterS', 'LetterSpacing', 'LetterT', 'LetterU', 'LetterV', 'LetterW', 'LetterX', 'LetterY', 'LetterZ', 'Letters', 'Library', 'LibraryBig', 'LifeBuoy', 'Ligature', 'Lightbulb', 'LightbulbOff', 'Lighthouse', 'LineDotBottomVertical', 'LineDotLeftHorizontal', 'LineDotRightHorizontal', 'LineDotTopVertical', 'LineHeight', 'LineSquiggle', 'LineStyle', 'Link', 'Link2', 'Link2Off', 'List', 'ListCheck', 'ListChecks', 'ListChevronsDownUp', 'ListChevronsUpDown', 'ListClock', 'ListCollapse', 'ListEnd', 'ListFilter', 'ListFilterPlus', 'ListIndentDecrease', 'ListIndentIncrease', 'ListMinus', 'ListMusic', 'ListOrdered', 'ListPlus', 'ListRestart', 'ListSortAscending', 'ListSortDescending', 'ListStart', 'ListTodo', 'ListTree', 'ListVideo', 'ListX', 'Loader', 'LoaderCircle', 'LoaderPinwheel', 'Locate', 'LocateFixed', 'LocateOff', 'Lock', 'LockKeyhole', 'LockKeyholeOpen', 'LockOpen', 'LogIn', 'LogOut', 'Logs', 'Lollipop', 'Luggage', 'Magnet', 'Mail', 'MailBadge', 'MailCheck', 'MailClock', 'MailDot', 'MailMinus', 'MailOpen', 'MailPen', 'MailPlus', 'MailQuestionMark', 'MailSearch', 'MailWarning', 'MailX', 'Mailbox', 'Mails', 'Map', 'MapMinus', 'MapPin', 'MapPinCheck', 'MapPinCheckInside', 'MapPinHouse', 'MapPinMinus', 'MapPinMinusInside', 'MapPinOff', 'MapPinPen', 'MapPinPlus', 'MapPinPlusInside', 'MapPinSearch', 'MapPinX', 'MapPinXInside', 'MapPinned', 'MapPlus', 'Margin', 'MarginBottom', 'MarginHorizontal', 'MarginLeft', 'MarginRight', 'MarginTop', 'MarginVertical', 'Mars', 'MarsStroke', 'Martini', 'Maximize', 'Maximize2', 'Medal', 'Megaphone', 'MegaphoneOff', 'MemoryStick', 'Menu', 'Merge', 'MessageCircle', 'MessageCircleCheck', 'MessageCircleCode', 'MessageCircleDashed', 'MessageCircleDashedCheck', 'MessageCircleHeart', 'MessageCircleMore', 'MessageCircleOff', 'MessageCirclePlus', 'MessageCircleQuestionMark', 'MessageCircleReply', 'MessageCircleText', 'MessageCircleWarning', 'MessageCircleX', 'MessageSquare', 'MessageSquareCheck', 'MessageSquareCode', 'MessageSquareDashed', 'MessageSquareDiff', 'MessageSquareDot', 'MessageSquareHeart', 'MessageSquareLock', 'MessageSquareMore', 'MessageSquareOff', 'MessageSquarePlus', 'MessageSquareQuote', 'MessageSquareReply', 'MessageSquareShare', 'MessageSquareText', 'MessageSquareWarning', 'MessageSquareX', 'MessagesCircle', 'MessagesSquare', 'Metronome', 'Mic', 'MicAudioLines', 'MicOff', 'MicSignal', 'MicVocal', 'Microchip', 'Microscope', 'Microwave', 'MidiPort', 'Milestone', 'Milk', 'MilkOff', 'Minimize', 'Minimize2', 'Minus', 'MirrorRectangular', 'MirrorRound', 'Monitor', 'MonitorActivity', 'MonitorCheck', 'MonitorCloud', 'MonitorCog', 'MonitorDot', 'MonitorDown', 'MonitorOff', 'MonitorPause', 'MonitorPc', 'MonitorPlay', 'MonitorSmartphone', 'MonitorSpeaker', 'MonitorStop', 'MonitorUp', 'MonitorX', 'Moon', 'MoonStar', 'Mop', 'MopSparkles', 'Mosque', 'Motorbike', 'Mountain', 'MountainSnow', 'Mouse', 'MouseLeft', 'MouseOff', 'MousePointer', 'MousePointer2', 'MousePointer2Off', 'MousePointerBan', 'MousePointerClick', 'MouseRight', 'Mouth', 'MouthOff', 'Move', 'Move3d', 'MoveDiagonal', 'MoveDiagonal2', 'MoveDown', 'MoveDownLeft', 'MoveDownRight', 'MoveHorizontal', 'MoveLeft', 'MoveRight', 'MoveUp', 'MoveUpLeft', 'MoveUpRight', 'MoveVertical', 'Navigation', 'Navigation2', 'Navigation2Off', 'NavigationOff', 'NepaliRupee', 'Network', 'Newspaper', 'Nfc', 'NonBinary', 'Notebook', 'NotebookDot', 'NotebookPen', 'NotebookTabs', 'NotebookText', 'NotepadText', 'NotepadTextDashed', 'Numbers', 'Nut', 'NutOff', 'Octagon', 'OctagonAlert', 'OctagonMinus', 'OctagonPause', 'OctagonX', 'Omega', 'Option', 'Orbit', 'Origami', 'Package', 'Package2', 'PackageCheck', 'PackageMinus', 'PackageOpen', 'PackagePlus', 'PackageSearch', 'PackageX', 'PaintBucket', 'PaintRoller', 'Paintbrush', 'PaintbrushVertical', 'Palette', 'Panda', 'PanelBottom', 'PanelBottomClose', 'PanelBottomDashed', 'PanelBottomOpen', 'PanelLeft', 'PanelLeftClose', 'PanelLeftDashed', 'PanelLeftOpen', 'PanelLeftRightDashed', 'PanelRight', 'PanelRightClose', 'PanelRightDashed', 'PanelRightOpen', 'PanelTop', 'PanelTopBottomDashed', 'PanelTopClose', 'PanelTopDashed', 'PanelTopOpen', 'PanelsLeftBottom', 'PanelsRightBottom', 'PanelsTopLeft', 'PaperBag', 'Paperclip', 'Parasol', 'Parentheses', 'Park', 'ParkingMeter', 'PartyPopper', 'Pause', 'PawPrint', 'PcCase', 'Pen', 'PenLine', 'PenOff', 'PenTool', 'Pencil', 'PencilLine', 'PencilOff', 'PencilRuler', 'PencilSparkles', 'Pentagon', 'Percent', 'PerfumeBottle', 'PersonStanding', 'Phi', 'PhilippinePeso', 'Phone', 'PhoneCall', 'PhoneForwarded', 'PhoneIncoming', 'PhoneLog', 'PhoneMissed', 'PhoneOff', 'PhoneOutgoing', 'Pi', 'Piano', 'Pickaxe', 'PictureInPicture', 'PictureInPicture2', 'PiggyBank', 'Pilcrow', 'PilcrowLeft', 'PilcrowRight', 'Pill', 'PillBottle', 'Pin', 'PinOff', 'Pipette', 'Pizza', 'Plane', 'PlaneLanding', 'PlaneTakeoff', 'PlantPot', 'Play', 'PlayOff', 'PlayingCard', 'PlayingCards', 'PlayingCardsFan', 'Plug', 'Plug2', 'PlugZap', 'Plus', 'PocketKnife', 'Podium', 'Pointer', 'PointerOff', 'Popcorn', 'Popsicle', 'PoundSterling', 'Power', 'PowerOff', 'Presentation', 'Printer', 'Printer3d', 'PrinterCheck', 'PrinterX', 'Projector', 'Proportions', 'Puzzle', 'Pyramid', 'QrCode', 'Quote', 'Rabbit', 'Radar', 'Radiation', 'Radical', 'Radio', 'RadioOff', 'RadioReceiver', 'RadioTower', 'Radius', 'Rainbow', 'Rat', 'Ratio', 'Receipt', 'ReceiptCent', 'ReceiptEuro', 'ReceiptIndianRupee', 'ReceiptJapaneseYen', 'ReceiptPoundSterling', 'ReceiptRussianRuble', 'ReceiptSwissFranc', 'ReceiptText', 'ReceiptTurkishLira', 'RectangleCircle', 'RectangleEllipsis', 'RectangleGoggles', 'RectangleHorizontal', 'RectangleVertical', 'Recycle', 'Redo', 'Redo2', 'RedoDot', 'RefreshCcw', 'RefreshCcwDot', 'RefreshCw', 'RefreshCwOff', 'Refrigerator', 'Regex', 'RemoveFormatting', 'Repeat', 'Repeat1', 'Repeat2', 'RepeatOff', 'Replace', 'ReplaceAll', 'Reply', 'ReplyAll', 'Rewind', 'Ribbon', 'Road', 'RobotArm', 'RobotVacuum', 'Rocket', 'RockingChair', 'RollerCoaster', 'Rose', 'Rotate3d', 'RotateCcw', 'RotateCcwClock', 'RotateCcwKey', 'RotateCcwSquare', 'RotateCw', 'RotateCwClock', 'RotateCwFadingClock', 'RotateCwSquare', 'Route', 'RouteOff', 'Router', 'Rows2', 'Rows3', 'Rows4', 'Rss', 'RugbyBall', 'Ruler', 'RulerDimensionLine', 'RussianRuble', 'Sailboat', 'Salad', 'Sandwich', 'Satellite', 'SatelliteDish', 'SaudiRiyal', 'Save', 'SaveAll', 'SaveCheck', 'SaveOff', 'SavePen', 'SavePlus', 'Scale', 'Scale3d', 'Scaling', 'Scan', 'ScanBarcode', 'ScanBox', 'ScanEye', 'ScanFace', 'ScanHeart', 'ScanLine', 'ScanQrCode', 'ScanSearch', 'ScanSquare', 'ScanText', 'School', 'Scissors', 'ScissorsLineDashed', 'Scooter', 'ScratchBlocks', 'ScreenShare', 'ScreenShareOff', 'Screw', 'Scroll', 'ScrollText', 'Search', 'SearchAlert', 'SearchCheck', 'SearchCode', 'SearchSlash', 'SearchX', 'Section', 'Send', 'SendHorizontal', 'SendToBack', 'SeparatorHorizontal', 'SeparatorVertical', 'Server', 'ServerCog', 'ServerCrash', 'ServerNas', 'ServerOff', 'ServerPlus', 'Settings', 'Settings2', 'Shapes', 'Share', 'Share2', 'Sheet', 'Shell', 'ShelvingUnit', 'Shield', 'ShieldAlert', 'ShieldBan', 'ShieldCheck', 'ShieldCog', 'ShieldCogCorner', 'ShieldEllipsis', 'ShieldHalf', 'ShieldHouse', 'ShieldKeyhole', 'ShieldLock', 'ShieldMinus', 'ShieldOff', 'ShieldPlus', 'ShieldQuestionMark', 'ShieldUser', 'ShieldX', 'Ship', 'ShipCargo', 'ShipWheel', 'Shirt', 'ShoppingBag', 'ShoppingBasket', 'ShoppingCart', 'ShoppingCartMinus', 'ShoppingCartPlus', 'Shovel', 'ShowerHead', 'Shredder', 'Shrimp', 'ShrimpOff', 'Shrink', 'Shrub', 'Shuffle', 'Sigma', 'Signal', 'SignalHigh', 'SignalLow', 'SignalMedium', 'SignalZero', 'Signature', 'Signpost', 'SignpostBig', 'Siren', 'SirenOff', 'SixteenthNotes', 'SkipBack', 'SkipForward', 'Skull', 'Slash', 'Slice', 'SlidersHorizontal', 'SlidersVertical', 'Smartphone', 'SmartphoneCharging', 'SmartphoneNfc', 'SmartphoneUserRound', 'Snail', 'Snowflake', 'SoapDispenserDroplet', 'Sofa', 'SolarPanel', 'Soup', 'Space', 'Spade', 'Sparkle', 'Sparkles', 'Speaker', 'Speech', 'SpellCheck', 'SpellCheck2', 'Spline', 'SplinePointer', 'Split', 'Spool', 'SportShoe', 'Spotlight', 'SprayCan', 'Sprout', 'Square', 'SquareActivity', 'SquareArrowDown', 'SquareArrowDownLeft', 'SquareArrowDownRight', 'SquareArrowLeft', 'SquareArrowOutDownLeft', 'SquareArrowOutDownRight', 'SquareArrowOutUpLeft', 'SquareArrowOutUpRight', 'SquareArrowRight', 'SquareArrowRightEnter', 'SquareArrowRightExit', 'SquareArrowUp', 'SquareArrowUpLeft', 'SquareArrowUpRight', 'SquareAsterisk', 'SquareBookmark', 'SquareBottomDashedScissors', 'SquareCenterlineDashedHorizontal', 'SquareCenterlineDashedVertical', 'SquareChartGantt', 'SquareCheck', 'SquareCheckBig', 'SquareChevronDown', 'SquareChevronLeft', 'SquareChevronRight', 'SquareChevronUp', 'SquareChevronsDown', 'SquareChevronsLeft', 'SquareChevronsRight', 'SquareChevronsUp', 'SquareCode', 'SquareDashed', 'SquareDashedBottom', 'SquareDashedBottomCode', 'SquareDashedKanban', 'SquareDashedMousePointer', 'SquareDashedPlus', 'SquareDashedText', 'SquareDashedTopSolid', 'SquareDashedX', 'SquareDashedXCorner', 'SquareDimensions', 'SquareDivide', 'SquareDot', 'SquareEqual', 'SquareExclamationPoint', 'SquareFunction', 'SquareKanban', 'SquareKanbanPlus', 'SquareLetterA', 'SquareLetterB', 'SquareLetterC', 'SquareLetterD', 'SquareLetterE', 'SquareLetterF', 'SquareLetterG', 'SquareLetterH', 'SquareLetterI', 'SquareLetterJ', 'SquareLetterK', 'SquareLetterL', 'SquareLetterM', 'SquareLetterN', 'SquareLetterO', 'SquareLetterP', 'SquareLetterPOff', 'SquareLetterQ', 'SquareLetterR', 'SquareLetterS', 'SquareLetterT', 'SquareLetterU', 'SquareLetterV', 'SquareLetterW', 'SquareLetterX', 'SquareLetterY', 'SquareLetterZ', 'SquareLibrary', 'SquareMenu', 'SquareMinus', 'SquareMousePointer', 'SquareOff', 'SquarePadding', 'SquarePaddingBottom', 'SquarePaddingHorizontal', 'SquarePaddingLeft', 'SquarePaddingRight', 'SquarePaddingTop', 'SquarePaddingVertical', 'SquarePause', 'SquarePen', 'SquarePercent', 'SquarePi', 'SquarePilcrow', 'SquarePlay', 'SquarePlus', 'SquarePower', 'SquareRadical', 'SquareRoundCorner', 'SquareScissors', 'SquareSigma', 'SquareSlash', 'SquareSparkles', 'SquareSplitHorizontal', 'SquareSplitVertical', 'SquareSquare', 'SquareStack', 'SquareStar', 'SquareStop', 'SquareTerminal', 'SquareText', 'SquareUser', 'SquareUserRound', 'SquareX', 'SquaresExclude', 'SquaresIntersect', 'SquaresSubtract', 'SquaresUnite', 'Squircle', 'SquircleDashed', 'Squirrel', 'Stamp', 'Star', 'StarCheck', 'StarHalf', 'StarMinus', 'StarOff', 'StarPlus', 'StarX', 'StepBack', 'StepForward', 'Stethoscope', 'Sticker', 'StickyNote', 'StickyNoteCheck', 'StickyNoteMinus', 'StickyNoteOff', 'StickyNotePlus', 'StickyNoteX', 'StickyNotes', 'Stone', 'Store', 'StretchHorizontal', 'StretchVertical', 'Strikethrough', 'Subscript', 'Summary', 'Sun', 'SunDim', 'SunMedium', 'SunMoon', 'SunSnow', 'Sunrise', 'Sunset', 'Superscript', 'SwatchBook', 'SwissFranc', 'SwitchCamera', 'Sword', 'Swords', 'Syringe', 'Table', 'Table2', 'TableCellsMerge', 'TableCellsSplit', 'TableColumnsSplit', 'TableOfContents', 'TableProperties', 'TableRowsSplit', 'Tablet', 'TabletSmartphone', 'Tablets', 'Tag', 'TagPlus', 'TagX', 'Tags', 'Tally1', 'Tally2', 'Tally3', 'Tally4', 'Tally5', 'Tangent', 'Target', 'Telescope', 'Tent', 'TentTree', 'Terminal', 'TestTube', 'TestTubeDiagonal', 'TestTubes', 'TextAlignCenter', 'TextAlignEnd', 'TextAlignJustify', 'TextAlignJustifyCenter', 'TextAlignJustifyEnd', 'TextAlignJustifyStart', 'TextAlignStart', 'TextCursor', 'TextCursorInput', 'TextInitial', 'TextQuote', 'TextSearch', 'TextWrap', 'Theater', 'Thermometer', 'ThermometerSnowflake', 'ThermometerSun', 'ThumbsDown', 'ThumbsUp', 'TicTacToe', 'Ticket', 'TicketCheck', 'TicketMinus', 'TicketPercent', 'TicketPlus', 'TicketSlash', 'TicketX', 'Tickets', 'TicketsPlane', 'Timeline', 'Timer', 'TimerOff', 'TimerReset', 'ToggleLeft', 'ToggleRight', 'Toilet', 'Tombstone', 'ToolCase', 'Toolbox', 'Toothbrush', 'ToothbrushSparkles', 'Tornado', 'Torus', 'Touchpad', 'TouchpadOff', 'TowelRack', 'TowerControl', 'ToyBrick', 'Tractor', 'TrafficCone', 'Trailer', 'TrainFront', 'TrainFrontTunnel', 'TrainTrack', 'TramFront', 'Transgender', 'Trash', 'TrashOff', 'TreeDeciduous', 'TreePalm', 'TreePine', 'Trees', 'TrendingDown', 'TrendingUp', 'TrendingUpDown', 'Triangle', 'TriangleAlert', 'TriangleDashed', 'TriangleRight', 'TrianglesCenterlineDashedHorizontal', 'TrianglesCenterlineDashedVertical', 'Trophy', 'Truck', 'TruckElectric', 'TubeLotion', 'TurkishLira', 'Turntable', 'Turtle', 'Tv', 'TvMinimal', 'TvMinimalPlay', 'Type', 'TypeOutline', 'Umbrella', 'UmbrellaOff', 'Underline', 'Undo', 'Undo2', 'UndoDot', 'UnfoldHorizontal', 'UnfoldVertical', 'Ungroup', 'University', 'Unlink', 'Unlink2', 'Unplug', 'Upload', 'Usb', 'UsbCPort', 'User', 'UserCheck', 'UserCog', 'UserGroup', 'UserKey', 'UserLock', 'UserMinus', 'UserPen', 'UserPlus', 'UserRound', 'UserRoundArrowLeft', 'UserRoundCheck', 'UserRoundCog', 'UserRoundGroup', 'UserRoundKey', 'UserRoundMinus', 'UserRoundPen', 'UserRoundPlus', 'UserRoundSearch', 'UserRoundShield', 'UserRoundStar', 'UserRoundX', 'UserSearch', 'UserShield', 'UserStar', 'UserX', 'Users', 'UsersCollaboration', 'UsersRound', 'UsersRoundCollaboration', 'Utensils', 'UtensilsCrossed', 'UtilityPole', 'Van', 'Variable', 'Vault', 'VectorPolygon', 'VectorSquare', 'Vegan', 'VenetianMask', 'Venus', 'VenusAndMars', 'Vibrate', 'VibrateOff', 'Video', 'VideoOff', 'Videotape', 'View', 'Virus', 'VirusOff', 'Voicemail', 'Volleyball', 'Volume', 'Volume1', 'Volume2', 'VolumeOff', 'VolumeX', 'Vote', 'Wallet', 'WalletCards', 'WalletMinimal', 'Wallpaper', 'Wand', 'WandSparkles', 'Warehouse', 'WashingMachine', 'Watch', 'WavesArrowDown', 'WavesArrowUp', 'WavesHorizontal', 'WavesLadder', 'WavesVertical', 'Waypoints', 'Webcam', 'WebcamOff', 'Webhook', 'WebhookOff', 'Weight', 'WeightTilde', 'Wheat', 'WheatOff', 'Whistle', 'WholeWord', 'Wifi', 'WifiCog', 'WifiHigh', 'WifiLock', 'WifiLow', 'WifiOff', 'WifiPen', 'WifiSync', 'WifiZero', 'Wind', 'WindArrowDown', 'WindArrowUp', 'Wine', 'WineOff', 'Workflow', 'Worm', 'Wrench', 'WrenchOff', 'X', 'XLineTop', 'Zap', 'ZapOff', 'ZodiacAquarius', 'ZodiacAries', 'ZodiacCancer', 'ZodiacCapricorn', 'ZodiacGemini', 'ZodiacLeo', 'ZodiacLibra', 'ZodiacOphiuchus', 'ZodiacPisces', 'ZodiacSagittarius', 'ZodiacScorpio', 'ZodiacTaurus', 'ZodiacVirgo', 'ZoomIn', 'ZoomOut');
  CREATE TABLE "pages_blocks_bento_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"highlight" varchar,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"cta_label" varchar,
  	"cta_link" varchar,
  	"icon_name" "enum_pages_blocks_bento_grid_items_icon_name",
  	"featured" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_bento_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_status_block_network_topics" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"topic" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_status_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"badge_label" varchar DEFAULT 'Status',
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_tech_section_key_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_tech_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section_label" varchar,
  	"heading" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bento_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"highlight" varchar,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"cta_label" varchar,
  	"cta_link" varchar,
  	"icon_name" "enum__pages_v_blocks_bento_grid_items_icon_name",
  	"featured" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bento_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_status_block_network_topics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"topic" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_status_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"badge_label" varchar DEFAULT 'Status',
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_tech_section_key_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_tech_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"section_label" varchar,
  	"heading" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "not_found" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "not_found_locales" (
  	"title" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"button_label" varchar NOT NULL,
  	"button_link" varchar DEFAULT '/' NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "not_found_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "_not_found_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_not_found_v_locales" (
  	"version_title" varchar NOT NULL,
  	"version_message" varchar NOT NULL,
  	"version_button_label" varchar NOT NULL,
  	"version_button_link" varchar DEFAULT '/' NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_not_found_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "translations_locales" (
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
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_translations_v_locales" (
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
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "show_stack_badge" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "cta_label2" varchar;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "cta_link2" varchar;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "show_stack_badge" boolean DEFAULT true;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "cta_label2" varchar;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "cta_link2" varchar;
  ALTER TABLE "navigation_header_links" ADD COLUMN "_locale" "_locales";
  UPDATE "navigation_header_links" SET "_locale" = 'en' WHERE "_locale" IS NULL;
  ALTER TABLE "navigation_header_links" ALTER COLUMN "_locale" SET NOT NULL;
  ALTER TABLE "navigation_footer_links" ADD COLUMN "_locale" "_locales";
  UPDATE "navigation_footer_links" SET "_locale" = 'en' WHERE "_locale" IS NULL;
  ALTER TABLE "navigation_footer_links" ALTER COLUMN "_locale" SET NOT NULL;
  ALTER TABLE "_navigation_v_version_header_links" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_navigation_v_version_footer_links" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_bento_grid_items" ADD CONSTRAINT "pages_blocks_bento_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bento_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bento_grid" ADD CONSTRAINT "pages_blocks_bento_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_status_block_network_topics" ADD CONSTRAINT "pages_blocks_status_block_network_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_status_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_status_block" ADD CONSTRAINT "pages_blocks_status_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tech_section_key_facts" ADD CONSTRAINT "pages_blocks_tech_section_key_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_tech_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tech_section" ADD CONSTRAINT "pages_blocks_tech_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bento_grid_items" ADD CONSTRAINT "_pages_v_blocks_bento_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bento_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bento_grid" ADD CONSTRAINT "_pages_v_blocks_bento_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_status_block_network_topics" ADD CONSTRAINT "_pages_v_blocks_status_block_network_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_status_block"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_status_block" ADD CONSTRAINT "_pages_v_blocks_status_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tech_section_key_facts" ADD CONSTRAINT "_pages_v_blocks_tech_section_key_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_tech_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tech_section" ADD CONSTRAINT "_pages_v_blocks_tech_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "not_found_locales" ADD CONSTRAINT "not_found_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."not_found"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "not_found_rels" ADD CONSTRAINT "not_found_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."not_found"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "not_found_rels" ADD CONSTRAINT "not_found_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_not_found_v_locales" ADD CONSTRAINT "_not_found_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_not_found_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_not_found_v_rels" ADD CONSTRAINT "_not_found_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_not_found_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_not_found_v_rels" ADD CONSTRAINT "_not_found_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "translations_locales" ADD CONSTRAINT "translations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."translations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_translations_v_locales" ADD CONSTRAINT "_translations_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_translations_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_bento_grid_items_order_idx" ON "pages_blocks_bento_grid_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_bento_grid_items_parent_id_idx" ON "pages_blocks_bento_grid_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bento_grid_items_locale_idx" ON "pages_blocks_bento_grid_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_bento_grid_order_idx" ON "pages_blocks_bento_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_bento_grid_parent_id_idx" ON "pages_blocks_bento_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bento_grid_path_idx" ON "pages_blocks_bento_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_bento_grid_locale_idx" ON "pages_blocks_bento_grid" USING btree ("_locale");
  CREATE INDEX "pages_blocks_status_block_network_topics_order_idx" ON "pages_blocks_status_block_network_topics" USING btree ("_order");
  CREATE INDEX "pages_blocks_status_block_network_topics_parent_id_idx" ON "pages_blocks_status_block_network_topics" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_status_block_network_topics_locale_idx" ON "pages_blocks_status_block_network_topics" USING btree ("_locale");
  CREATE INDEX "pages_blocks_status_block_order_idx" ON "pages_blocks_status_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_status_block_parent_id_idx" ON "pages_blocks_status_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_status_block_path_idx" ON "pages_blocks_status_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_status_block_locale_idx" ON "pages_blocks_status_block" USING btree ("_locale");
  CREATE INDEX "pages_blocks_tech_section_key_facts_order_idx" ON "pages_blocks_tech_section_key_facts" USING btree ("_order");
  CREATE INDEX "pages_blocks_tech_section_key_facts_parent_id_idx" ON "pages_blocks_tech_section_key_facts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tech_section_key_facts_locale_idx" ON "pages_blocks_tech_section_key_facts" USING btree ("_locale");
  CREATE INDEX "pages_blocks_tech_section_order_idx" ON "pages_blocks_tech_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_tech_section_parent_id_idx" ON "pages_blocks_tech_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tech_section_path_idx" ON "pages_blocks_tech_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_tech_section_locale_idx" ON "pages_blocks_tech_section" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_bento_grid_items_order_idx" ON "_pages_v_blocks_bento_grid_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bento_grid_items_parent_id_idx" ON "_pages_v_blocks_bento_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bento_grid_items_locale_idx" ON "_pages_v_blocks_bento_grid_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_bento_grid_order_idx" ON "_pages_v_blocks_bento_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bento_grid_parent_id_idx" ON "_pages_v_blocks_bento_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bento_grid_path_idx" ON "_pages_v_blocks_bento_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bento_grid_locale_idx" ON "_pages_v_blocks_bento_grid" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_status_block_network_topics_order_idx" ON "_pages_v_blocks_status_block_network_topics" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_status_block_network_topics_parent_id_idx" ON "_pages_v_blocks_status_block_network_topics" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_status_block_network_topics_locale_idx" ON "_pages_v_blocks_status_block_network_topics" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_status_block_order_idx" ON "_pages_v_blocks_status_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_status_block_parent_id_idx" ON "_pages_v_blocks_status_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_status_block_path_idx" ON "_pages_v_blocks_status_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_status_block_locale_idx" ON "_pages_v_blocks_status_block" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_tech_section_key_facts_order_idx" ON "_pages_v_blocks_tech_section_key_facts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_tech_section_key_facts_parent_id_idx" ON "_pages_v_blocks_tech_section_key_facts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_tech_section_key_facts_locale_idx" ON "_pages_v_blocks_tech_section_key_facts" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_tech_section_order_idx" ON "_pages_v_blocks_tech_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_tech_section_parent_id_idx" ON "_pages_v_blocks_tech_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_tech_section_path_idx" ON "_pages_v_blocks_tech_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_tech_section_locale_idx" ON "_pages_v_blocks_tech_section" USING btree ("_locale");
  CREATE UNIQUE INDEX "not_found_locales_parent_id_locale_unique" ON "not_found_locales" USING btree ("_parent_id","_locale");
  CREATE INDEX "not_found_rels_order_idx" ON "not_found_rels" USING btree ("order");
  CREATE INDEX "not_found_rels_parent_idx" ON "not_found_rels" USING btree ("parent_id");
  CREATE INDEX "not_found_rels_path_idx" ON "not_found_rels" USING btree ("path");
  CREATE INDEX "not_found_rels_users_id_idx" ON "not_found_rels" USING btree ("users_id");
  CREATE INDEX "_not_found_v_created_at_idx" ON "_not_found_v" USING btree ("created_at");
  CREATE INDEX "_not_found_v_updated_at_idx" ON "_not_found_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_not_found_v_locales_parent_id_locale_unique" ON "_not_found_v_locales" USING btree ("_parent_id","_locale");
  CREATE INDEX "_not_found_v_rels_order_idx" ON "_not_found_v_rels" USING btree ("order");
  CREATE INDEX "_not_found_v_rels_parent_idx" ON "_not_found_v_rels" USING btree ("parent_id");
  CREATE INDEX "_not_found_v_rels_path_idx" ON "_not_found_v_rels" USING btree ("path");
  CREATE INDEX "_not_found_v_rels_users_id_idx" ON "_not_found_v_rels" USING btree ("users_id");
  CREATE UNIQUE INDEX "translations_locales_parent_id_locale_unique" ON "translations_locales" USING btree ("_parent_id","_locale");
  CREATE UNIQUE INDEX "_translations_v_locales_parent_id_locale_unique" ON "_translations_v_locales" USING btree ("_parent_id","_locale");
  CREATE INDEX "navigation_header_links_locale_idx" ON "navigation_header_links" USING btree ("_locale");
  CREATE INDEX "navigation_footer_links_locale_idx" ON "navigation_footer_links" USING btree ("_locale");
  CREATE INDEX "_navigation_v_version_header_links_locale_idx" ON "_navigation_v_version_header_links" USING btree ("_locale");
  CREATE INDEX "_navigation_v_version_footer_links_locale_idx" ON "_navigation_v_version_footer_links" USING btree ("_locale");
  INSERT INTO "translations_locales" ("settings_title", "settings_theme_heading", "settings_theme_description", "settings_font_size_heading", "settings_font_size_description", "settings_animations_heading", "settings_animations_description", "common_system", "common_light", "common_dark", "common_normal", "common_large", "common_on", "common_off", "common_theme", "common_settings_button_aria", "_locale", "_parent_id")
  SELECT "settings_title", "settings_theme_heading", "settings_theme_description", "settings_font_size_heading", "settings_font_size_description", "settings_animations_heading", "settings_animations_description", "common_system", "common_light", "common_dark", "common_normal", "common_large", "common_on", "common_off", "common_theme", "common_settings_button_aria", 'en', "id" FROM "translations"
  WHERE NOT EXISTS (SELECT 1 FROM "translations_locales" WHERE "_parent_id" = "translations"."id" AND "_locale" = 'en');
  ALTER TABLE "translations" DROP COLUMN "settings_title";
  ALTER TABLE "translations" DROP COLUMN "settings_theme_heading";
  ALTER TABLE "translations" DROP COLUMN "settings_theme_description";
  ALTER TABLE "translations" DROP COLUMN "settings_font_size_heading";
  ALTER TABLE "translations" DROP COLUMN "settings_font_size_description";
  ALTER TABLE "translations" DROP COLUMN "settings_animations_heading";
  ALTER TABLE "translations" DROP COLUMN "settings_animations_description";
  ALTER TABLE "translations" DROP COLUMN "common_system";
  ALTER TABLE "translations" DROP COLUMN "common_light";
  ALTER TABLE "translations" DROP COLUMN "common_dark";
  ALTER TABLE "translations" DROP COLUMN "common_normal";
  ALTER TABLE "translations" DROP COLUMN "common_large";
  ALTER TABLE "translations" DROP COLUMN "common_on";
  ALTER TABLE "translations" DROP COLUMN "common_off";
  ALTER TABLE "translations" DROP COLUMN "common_theme";
  ALTER TABLE "translations" DROP COLUMN "common_settings_button_aria";
  ALTER TABLE "_translations_v" DROP COLUMN "version_settings_title";
  ALTER TABLE "_translations_v" DROP COLUMN "version_settings_theme_heading";
  ALTER TABLE "_translations_v" DROP COLUMN "version_settings_theme_description";
  ALTER TABLE "_translations_v" DROP COLUMN "version_settings_font_size_heading";
  ALTER TABLE "_translations_v" DROP COLUMN "version_settings_font_size_description";
  ALTER TABLE "_translations_v" DROP COLUMN "version_settings_animations_heading";
  ALTER TABLE "_translations_v" DROP COLUMN "version_settings_animations_description";
  ALTER TABLE "_translations_v" DROP COLUMN "version_common_system";
  ALTER TABLE "_translations_v" DROP COLUMN "version_common_light";
  ALTER TABLE "_translations_v" DROP COLUMN "version_common_dark";
  ALTER TABLE "_translations_v" DROP COLUMN "version_common_normal";
  ALTER TABLE "_translations_v" DROP COLUMN "version_common_large";
  ALTER TABLE "_translations_v" DROP COLUMN "version_common_on";
  ALTER TABLE "_translations_v" DROP COLUMN "version_common_off";
  ALTER TABLE "_translations_v" DROP COLUMN "version_common_theme";
  ALTER TABLE "_translations_v" DROP COLUMN "version_common_settings_button_aria";`);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_bento_grid_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bento_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_status_block_network_topics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_status_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_tech_section_key_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_tech_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bento_grid_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bento_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_status_block_network_topics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_status_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_tech_section_key_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_tech_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "not_found" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "not_found_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "not_found_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_not_found_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_not_found_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_not_found_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "translations_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_translations_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_bento_grid_items" CASCADE;
  DROP TABLE "pages_blocks_bento_grid" CASCADE;
  DROP TABLE "pages_blocks_status_block_network_topics" CASCADE;
  DROP TABLE "pages_blocks_status_block" CASCADE;
  DROP TABLE "pages_blocks_tech_section_key_facts" CASCADE;
  DROP TABLE "pages_blocks_tech_section" CASCADE;
  DROP TABLE "_pages_v_blocks_bento_grid_items" CASCADE;
  DROP TABLE "_pages_v_blocks_bento_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_status_block_network_topics" CASCADE;
  DROP TABLE "_pages_v_blocks_status_block" CASCADE;
  DROP TABLE "_pages_v_blocks_tech_section_key_facts" CASCADE;
  DROP TABLE "_pages_v_blocks_tech_section" CASCADE;
  DROP TABLE "not_found" CASCADE;
  DROP TABLE "not_found_locales" CASCADE;
  DROP TABLE "not_found_rels" CASCADE;
  DROP TABLE "_not_found_v" CASCADE;
  DROP TABLE "_not_found_v_locales" CASCADE;
  DROP TABLE "_not_found_v_rels" CASCADE;
  DROP TABLE "translations_locales" CASCADE;
  DROP TABLE "_translations_v_locales" CASCADE;
  DROP INDEX "navigation_header_links_locale_idx";
  DROP INDEX "navigation_footer_links_locale_idx";
  DROP INDEX "_navigation_v_version_header_links_locale_idx";
  DROP INDEX "_navigation_v_version_footer_links_locale_idx";
  ALTER TABLE "translations" ADD COLUMN "settings_title" varchar DEFAULT 'Settings' NOT NULL;
  ALTER TABLE "translations" ADD COLUMN "settings_theme_heading" varchar DEFAULT 'Theme' NOT NULL;
  ALTER TABLE "translations" ADD COLUMN "settings_theme_description" varchar DEFAULT 'Choose your preferred color scheme.' NOT NULL;
  ALTER TABLE "translations" ADD COLUMN "settings_font_size_heading" varchar DEFAULT 'Font Size' NOT NULL;
  ALTER TABLE "translations" ADD COLUMN "settings_font_size_description" varchar DEFAULT 'Adjust the base text size.' NOT NULL;
  ALTER TABLE "translations" ADD COLUMN "settings_animations_heading" varchar DEFAULT 'Animations' NOT NULL;
  ALTER TABLE "translations" ADD COLUMN "settings_animations_description" varchar DEFAULT 'Enable or disable smooth transitions.' NOT NULL;
  ALTER TABLE "translations" ADD COLUMN "common_system" varchar DEFAULT 'System' NOT NULL;
  ALTER TABLE "translations" ADD COLUMN "common_light" varchar DEFAULT 'Light' NOT NULL;
  ALTER TABLE "translations" ADD COLUMN "common_dark" varchar DEFAULT 'Dark' NOT NULL;
  ALTER TABLE "translations" ADD COLUMN "common_normal" varchar DEFAULT 'Normal' NOT NULL;
  ALTER TABLE "translations" ADD COLUMN "common_large" varchar DEFAULT 'Large' NOT NULL;
  ALTER TABLE "translations" ADD COLUMN "common_on" varchar DEFAULT 'Enabled' NOT NULL;
  ALTER TABLE "translations" ADD COLUMN "common_off" varchar DEFAULT 'Disabled' NOT NULL;
  ALTER TABLE "translations" ADD COLUMN "common_theme" varchar DEFAULT 'Theme' NOT NULL;
  ALTER TABLE "translations" ADD COLUMN "common_settings_button_aria" varchar DEFAULT 'Personalize your experience' NOT NULL;
  ALTER TABLE "_translations_v" ADD COLUMN "version_settings_title" varchar DEFAULT 'Settings' NOT NULL;
  ALTER TABLE "_translations_v" ADD COLUMN "version_settings_theme_heading" varchar DEFAULT 'Theme' NOT NULL;
  ALTER TABLE "_translations_v" ADD COLUMN "version_settings_theme_description" varchar DEFAULT 'Choose your preferred color scheme.' NOT NULL;
  ALTER TABLE "_translations_v" ADD COLUMN "version_settings_font_size_heading" varchar DEFAULT 'Font Size' NOT NULL;
  ALTER TABLE "_translations_v" ADD COLUMN "version_settings_font_size_description" varchar DEFAULT 'Adjust the base text size.' NOT NULL;
  ALTER TABLE "_translations_v" ADD COLUMN "version_settings_animations_heading" varchar DEFAULT 'Animations' NOT NULL;
  ALTER TABLE "_translations_v" ADD COLUMN "version_settings_animations_description" varchar DEFAULT 'Enable or disable smooth transitions.' NOT NULL;
  ALTER TABLE "_translations_v" ADD COLUMN "version_common_system" varchar DEFAULT 'System' NOT NULL;
  ALTER TABLE "_translations_v" ADD COLUMN "version_common_light" varchar DEFAULT 'Light' NOT NULL;
  ALTER TABLE "_translations_v" ADD COLUMN "version_common_dark" varchar DEFAULT 'Dark' NOT NULL;
  ALTER TABLE "_translations_v" ADD COLUMN "version_common_normal" varchar DEFAULT 'Normal' NOT NULL;
  ALTER TABLE "_translations_v" ADD COLUMN "version_common_large" varchar DEFAULT 'Large' NOT NULL;
  ALTER TABLE "_translations_v" ADD COLUMN "version_common_on" varchar DEFAULT 'Enabled' NOT NULL;
  ALTER TABLE "_translations_v" ADD COLUMN "version_common_off" varchar DEFAULT 'Disabled' NOT NULL;
  ALTER TABLE "_translations_v" ADD COLUMN "version_common_theme" varchar DEFAULT 'Theme' NOT NULL;
  ALTER TABLE "_translations_v" ADD COLUMN "version_common_settings_button_aria" varchar DEFAULT 'Personalize your experience' NOT NULL;
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "show_stack_badge";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "cta_label2";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "cta_link2";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "show_stack_badge";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "cta_label2";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "cta_link2";
  ALTER TABLE "navigation_header_links" DROP COLUMN "_locale";
  ALTER TABLE "navigation_footer_links" DROP COLUMN "_locale";
  ALTER TABLE "_navigation_v_version_header_links" DROP COLUMN "_locale";
  ALTER TABLE "_navigation_v_version_footer_links" DROP COLUMN "_locale";
  DROP TYPE "public"."enum_pages_blocks_bento_grid_items_icon_name";
  DROP TYPE "public"."enum__pages_v_blocks_bento_grid_items_icon_name";`);
}
