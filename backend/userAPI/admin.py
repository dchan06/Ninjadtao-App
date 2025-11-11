from django.contrib import admin
from .models import Classes, userModel, BookedClasses

admin.site.register(userModel)
admin.site.register(Classes)
admin.site.register(BookedClasses)

