from django.contrib import admin
from .models import *

admin.site.site_header = "NinjadtaoApp Admin"
admin.site.register(userModel)
admin.site.register(Classes)
admin.site.register(BookedClasses)
admin.site.register(MembershipsBought)


